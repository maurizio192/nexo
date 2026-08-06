const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
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
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "NEXO Backend funzionante 🚀",
  });
});
const prodotti = [
  {
    id: 1,
    nome: "Harina 00",
    unita: "kg",
    prezzo: 0.95,
    stock: 25,
  },
  {
    id: 2,
    nome: "Mozzarella",
    unita: "kg",
    prezzo: 7.8,
    stock: 12,
  },
  {
    id: 3,
    nome: "Parmigiano",
    unita: "kg",
    prezzo: 14.5,
    stock: 6,
  },
];
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
