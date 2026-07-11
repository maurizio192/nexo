const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nexo",
  password: "Nexo2026!",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("✅ Connesso a PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ Errore PostgreSQL:", err.message);
  });

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "NEXO Backend funzionante 🚀",
  });
});

app.get("/prodotti", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos ORDER BY id"
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore del database",
    });
  }
});
app.post("/test", (req, res) => {
  res.json({ ok: true });
});
app.post("/prodotti", async (req, res) => {
  try {
    const {
      nombre,
      unidad,
      precio,
      stock,
      categoria,
      proveedor,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO productos
      (nombre, unidad, precio, stock, categoria, proveedor)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [nombre, unidad, precio, stock, categoria, proveedor]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore durante il salvataggio",
    });
  }
});
console.log("✅ Ruta POST /prodotti registrata");
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});