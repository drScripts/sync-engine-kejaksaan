const { mongoClient } = require("./config");
const { ObjectId } = require("mongodb");

const database = mongoClient.db("636b7a77cbff4c962e39e9f1");
const idMap = database.collection("idMaps");

// relation info in table cases
const relationFields = ["satkersId", "locationId", "caseTypeId", "caseStageId"];

const relationFieldWithForeignTable = {
  satkersId: "satkers",
  locationId: "locations",
  caseTypeId: "caseTypes",
  caseStageId: "caseStages",
};

const relationFieldWithPivotTable = {
  satkersId: "cases_satkers",
  locationId: "cases_location",
  caseTypeId: "cases_caseType",
  caseStageId: "cases_caseStage",
};

const syncer = (app) => {
  const handleRelationField = async (data) => {
    const parsedData = await Promise.all(
      Object.entries(data).map(async ([field, value]) => {
        if (relationFields.includes(field)) {
          return {
            [field]: await getTargetId(
              relationFieldWithForeignTable[field],
              value
            ),
          };
        } else {
          return { [field]: value };
        }
      })
    );

    return Object.assign({}, ...parsedData);
  };

  const handleInsertToPivot = async (data, caseId) => {
    const parsedData = await Promise.all(
      Object.entries(data).map(async ([field, value]) => {
        if (relationFields.includes(field)) {
          await database
            .collection(relationFieldWithPivotTable[field])
            .insertOne({ [field]: value, casesId: caseId });
          return {};
        }

        return { [field]: value };
      })
    );

    return Object.assign({}, ...parsedData);
  };

  const handleUpdateToPivot = async (data, caseId) => {
    const parsedData = await Promise.all(
      Object.entries(data).map(async ([field, value]) => {
        if (relationFields.includes(field)) {
          await database
            .collection(relationFieldWithPivotTable[field])
            .updateOne({ casesId: caseId }, { $set: { [field]: value } });
          return {};
        }

        return { [field]: value };
      })
    );

    return Object.assign({}, ...parsedData);
  };

  const getTargetId = async (tableName, sourceId) => {
    let res = await idMap.findOne({ sourceId, tableName, app });

    // handle if source id not registerd
    if (!res) {
      return (
        await idMap.insertOne({
          sourceId,
          tableName,
          targetId: new ObjectId().toHexString(),
          app,
        })
      ).insertedId;
    }

    return res.targetId;
  };

  const createIdMap = (tableName, sourceId, targetId) => {
    return idMap.insertOne({ sourceId, targetId, tableName, app });
  };

  const insert = async (tableName, data) => {
    let newData = { ...data };
    if (tableName === "cases") {
      newData = await handleRelationField(data);
    }

    if (newData.id) {
      newData._id = new ObjectId(newData.id).toHexString();
      delete newData.id;
    }

    const res = await database.collection(tableName).insertOne(newData);
    await createIdMap(tableName, data.id, res.insertedId);

    if (tableName === "cases") {
      await handleInsertToPivot(newData, res.insertedId);
    }
  };

  const update = async (tableName, id, data) => {
    let newData = { ...data };
    if (tableName === "cases") {
      newData = await handleRelationField(data);
    }

    delete newData.id;
    const targetId = await getTargetId(tableName, id);
    await database.collection(tableName).updateOne(
      {
        _id: targetId,
      },
      { $set: newData }
    );

    if (tableName === "cases") {
      await handleUpdateToPivot(newData, targetId);
    }
  };

  const _delete = async (tableName, id) => {
    const targetId = await getTargetId(tableName, id);
    return database.collection(tableName).deleteOne({
      _id: targetId,
    });
  };

  return {
    insert,
    update,
    delete: _delete,
  };
};

module.exports = syncer;
