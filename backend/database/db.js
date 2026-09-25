require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "nexo",
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then(() => {
    console.log("✅ PostgreSQL conectado");
  })
  .catch((err) => {
    console.error("❌ Error PostgreSQL:", err.message);
  });

module.exports = pool;