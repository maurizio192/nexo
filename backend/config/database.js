const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nexo",
  password: "***REMOVED-NEXO-CREDENTIAL***",
  port: 5432,
});

module.exports = pool;