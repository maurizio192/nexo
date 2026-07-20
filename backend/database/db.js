const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nexo",
  password: "Nexo2026!",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL conectado");
  })
  .catch((err) => {
    console.error("❌ Error PostgreSQL:", err.message);
  });

module.exports = pool;