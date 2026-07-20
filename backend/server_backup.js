const sanchoRoutes = require("./routes/sancho");
const proveedoresRoutes = require("./routes/proveedores");
const productosRoutes = require("./routes/productos");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const motor = require("./motor");
const memoria = require("./motor/memoria");
const app = express();
const consumos = require("./motor/consumos");
const ventasRoutes = require("./routes/ventas");
const pedidosRoutes = require("./routes/pedidos");

app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "nexo",
  password: "Nexo2026!",
  port: 5432,

});
app.locals.pool = pool;
app.use("/proveedores", proveedoresRoutes(pool));
app.use("/productos", productosRoutes(pool));
app.use("/ventas", ventasRoutes(pool));
app.use("/pedidos", pedidosRoutes(pool));


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


app.get("/producciones", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM producciones ORDER BY fecha DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore database",
    });
  }
});
app.get("/elaboraciones", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM elaboraciones ORDER BY nombre"
    );

app.put("/elaboraciones/:id/descontar", async (req, res) => {

  try {

    const { id } = req.params;
    const { cantidad } = req.body;

    const result = await pool.query(
      `
      UPDATE elaboraciones
      SET bolsas_actuales = bolsas_actuales - $1
      WHERE id = $2
      RETURNING *;
      `,
      [cantidad, id]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  }

});
    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore caricamento elaboraciones",
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
});

  
app.post("/proveedores", async (req, res) => {

    const {
        nombre,
        contacto,
        telefono,
        email
    } = req.body;

    try {

        const resultado = await pool.query(
            `INSERT INTO proveedores
            (nombre, contacto, telefono, email)
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
            [nombre, contacto, telefono, email]
        );

        res.json(resultado.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Errore database"
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

app.post("/elaboraciones", async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      dias_conservacion,
      tipo,
      activa,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO elaboraciones
      (nombre, categoria, dias_conservacion, tipo, activa)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        nombre,
        categoria,
        dias_conservacion,
        tipo,
        activa,
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      errore: "Errore salvataggio elaborazione",
    });
  }
});
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
await memoria.guardar(
  pool,
  "producto",
  `Se creó el producto "${nombre}"`
);
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
app.use("/sancho", sanchoRoutes);

app.post("/consumir/:id", async (req, res) => {

  try {

    const id = req.params.id;

    await consumos.registrarConsumo(pool, id, 1);

    await motor.iniciarMotor(pool);

    res.json({
      ok: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      errore: "Errore consumo"
    });

   }
});


const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});

