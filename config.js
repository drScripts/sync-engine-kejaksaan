const { Client } = require("pg");
const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(
  "mongodb://root:password@mongo-1667988054.deployment.microgen.id:32594"
);

const pgClient1 = new Client({
  host: "pg-satker-langkat.deployment.microgen.id",
  port: 32294,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClient2 = new Client({
  host: "pg-jakarta-utara.deployment.microgen.id",
  port: 31314,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClient3 = new Client({
  host: "pg-surabaya.deployment.microgen.id",
  port: 30622,
  database: "postgres",
  user: "root",
  password: "password",
});

const pgClients = [
  {
    app: "satker negeri langkat",
    pgClient: pgClient1,
  },
  {
    app: "satker jakarta utara",
    pgClient: pgClient2,
  },
  {
    app: "satker surabaya",
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
