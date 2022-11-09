const { Client } = require("pg");
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(
  "mongodb://root:password@mongo-1667988054.deployment.microgen.id:32594"
);

const pgClient1 = new Client({
  host: "satker-ri.deployment.microgen.id",
  port: 31576,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClient2 = new Client({
  host: "satker-jakarta.deployment.microgen.id",
  port: 30128,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClient3 = new Client({
  host: "satker-jogja.deployment.microgen.id",
  port: 30222,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClients = [
  {
    app: "satker republik indonesia",
    pgClient: pgClient1,
  },
  {
    app: "satker jakarta",
    pgClient: pgClient2,
  },
  {
    app: "satker jogja",
    pgClient: pgClient3,
  },
];

mongoClient.connect();
pgClient1.connect();
pgClient2.connect();
pgClient3.connect();

module.exports = {
  mongoClient,
  pgClients,
};
