const { mongoClient } = require("./config")
const { ObjectId } = require("mongodb")

const database = mongoClient.db('replication');
const todo = database.collection('todo');
const idMap = database.collection("idMaps")

const getTargetId = async (sourceId) => {
    const res = await idMap.findOne({ sourceId })
    return res.targetId
}

const createIdMap = (sourceId, targetId) => {
    return idMap.insertOne({sourceId, targetId })
}

const insert = async (data) => {
    const newData = {...data}
    if(newData.id) {
        newData._id = new ObjectId(newData.id)
        delete newData.id
    }
    const res = await todo.insertOne(newData)
    await createIdMap(data.id, res.insertedId)
}

const update = async (id, data) => {
    const targetId = await getTargetId(id)
    const newData = {...data}
    delete newData.id
    await todo.updateOne({
        _id: targetId,
    }, { $set: newData})
}

const _delete = async (id) => {
    const targetId = await getTargetId(id)
    return todo.deleteOne({
        _id: targetId,
    })
}

module.exports = {
    insert,
    update,
    _delete
}