const { mongoClient } = require("./config")
const { ObjectId } = require("mongodb")

const database = mongoClient.db('replication');
const idMap = database.collection("idMaps")

const relationFields = [
    "satKerId",
    "locationId",
    "caseTypeId",
    "caseStageId",
]

const relationFieldWithForeignKey = {
    "satKerId": "satkers",
    "locationId": "locations",
    "caseTypeId": "caseTypes",
    "caseStageId": "caseStages",
}

const handleRelationField = async (data) => {
    const parsedData = await Promise.all(Object.entries(data).map(async([field,value]) => {
        if(relationFields.includes(field)) {
            return { [field]: await getTargetId(relationFieldWithForeignKey[field], value) }
        } else {
            return { [field]: value }
        }
    }))

    return Object.assign({}, ...parsedData)
}

const getTargetId = async (tableName, sourceId) => {
    const res = await idMap.findOne({ sourceId, tableName })
    if (!res) {
        console.log("failed translate id source to target", {
            tableName,
            sourceId,
            res
        })
    }
    return res.targetId
}

const createIdMap = (tableName, sourceId, targetId) => {
    return idMap.insertOne({ sourceId, targetId, tableName })
}

const insert = async (tableName, data) => {
    let newData = { ...data }
    if(tableName === "cases") {
        newData = await handleRelationField(data)
    }

    if (newData.id) {
        newData._id = new ObjectId(newData.id)
        delete newData.id
    }
    const res = await database.collection(tableName).insertOne(newData)
    await createIdMap(tableName, data.id, res.insertedId)
}

const update = async (tableName, id, data) => {
    let newData = { ...data }
    if(tableName === "cases") {
        const data = await handleRelationField(data)
    }
    delete newData.id
    const targetId = await getTargetId(tableName,id)
    await database.collection(tableName).updateOne({
        _id: targetId,
    }, { $set: newData })
}

const _delete = async (tableName, id) => {
    const targetId = await getTargetId(tableName,id)
    return database.collection(tableName).deleteOne({
        _id: targetId,
    })
}

module.exports = {
    insert,
    update,
    _delete
}