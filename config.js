const { Client } = require('pg')
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient("mongodb://root:example@localhost:27017");

const pgClient = new Client({
    host: "0.0.0.0",
    port: 54320,
    database: "postgres",
    user: "user",
    password: "admin"
})

const pgClients = [
    {
        app: "satker jambi",
        pgClient: pgClient
    }
]


mongoClient.connect()
pgClient.connect()

module.exports = {
    mongoClient,
    pgClients
}