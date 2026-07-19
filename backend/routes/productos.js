const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

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
router.post("/", async (req, res) => {

  try {

    const {
  codigo,
  nombre,
  unidad,

  formatoCompra,
  cantidadFormato,
  stockMinimo,
  ubicacion,

  precio,
  stock,
  categoria,
  proveedor
} = req.body;

    const result = await pool.query(
  `INSERT INTO productos
  (
    codigo,
    nombre,
    unidad,
    formato_compra,
    cantidad_formato,
    stock_minimo,
    ubicacion,
    precio,
    stock,
    categoria,
    proveedor
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING *`,
  [
    codigo,
    nombre,
    unidad,

    formatoCompra,
    cantidadFormato,
    stockMinimo,
    ubicacion,

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
      error: err.message
    });

  }

});
router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const {
      codigo,
      nombre,
      unidad,

      formatoCompra,
      cantidadFormato,
      stockMinimo,
      ubicacion,

      precio,
      stock,
      categoria,
      proveedor

    } = req.body;

    const result = await pool.query(
      `
      UPDATE productos
      SET
        codigo = $1,
        nombre = $2,
        unidad = $3,
        formato_compra = $4,
        cantidad_formato = $5,
        stock_minimo = $6,
        ubicacion = $7,
        precio = $8,
        stock = $9,
        categoria = $10,
        proveedor = $11
      WHERE id = $12
      RETURNING *
      `,
      [
        codigo,
        nombre,
        unidad,

        formatoCompra,
        cantidadFormato,
        stockMinimo,
        ubicacion,

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
      error: err.message
    });

  }

});
  return router;

};
