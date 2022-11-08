const { mongoClient } = require("./config")

const database = mongoClient.db('replication');
const monitoring = database.collection('monitoring');

const create = async ({ created, deleted, updated, payload }) => {
    monitoring.insertOne({
        sycnAt: new Date(),
        created,
        deleted,
        updated,
        payload
    })
}


module.exports = {
    create
}