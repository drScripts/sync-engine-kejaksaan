const { mongoClient } = require("./config")

const database = mongoClient.db('636b7a77cbff4c962e39e9f1');
const monitoring = database.collection('monitorings');

const create = async (metrics) => {
    return monitoring.insertOne(metrics)
}

module.exports = {
    create
}