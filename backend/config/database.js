const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nexo",
  password: "Nexo2026!",
  port: 5432,
});

module.exports = pool;