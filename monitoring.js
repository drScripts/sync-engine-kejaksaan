const { mongoClient } = require("./config")

const database = mongoClient.db('replication');
const monitoring = database.collection('monitorings');

const create = async (metrics) => {
    return monitoring.insertOne(metrics)
}

module.exports = {
    create
}