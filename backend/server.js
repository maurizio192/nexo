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
app.get("/categorias", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categorias ORDER BY nombre"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore caricamento categorie",
    });
  }
});app.get("/proveedores", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM proveedores ORDER BY nombre"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore caricamento proveedores",
    });
  }
});
app.post("/prodotti", async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      unidad,
      precio,
      stock,
      categoria,
      proveedor,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO productos
      (codigo, nombre, unidad, precio, stock, categoria, proveedor)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        codigo,
        nombre,
        unidad,
        precio,
        stock,
        categoria,
        proveedor,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore durante il salvataggio",
    });
  }
});

app.put("/prodotti/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      codigo,
      nombre,
      unidad,
      precio,
      stock,
      categoria,
      proveedor,
    } = req.body;

    const result = await pool.query(
      `UPDATE productos
       SET codigo = $1,
           nombre = $2,
           unidad = $3,
           precio = $4,
           stock = $5,
           categoria = $6,
           proveedor = $7
       WHERE id = $8
       RETURNING *`,
      [
        codigo,
        nombre,
        unidad,
        precio,
        stock,
        categoria,
        proveedor,
        id,
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore aggiornamento prodotto",
    });
  }
});

app.delete("/prodotti/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM productos WHERE id = $1",
      [id]
    );

    res.json({
      ok: true,
      mensaje: "Producto eliminado correctamente",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore durante l'eliminazione",
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});