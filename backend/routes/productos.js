const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // ==========================
  // LISTAR PRODUCTOS
  // ==========================

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT *
        FROM productos
        ORDER BY nombre
      `);

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // ==========================
  // CREAR PRODUCTO
  // ==========================

  router.post("/", async (req, res) => {

    try {

      const {
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
        INSERT INTO productos
        (
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
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
        `,
        [
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

  // ==========================
  // MODIFICAR PRODUCTO
  // ==========================

  router.put("/:id", async (req, res) => {

    try {

      const {
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
          nombre=$1,
          unidad=$2,
          formato_compra=$3,
          cantidad_formato=$4,
          stock_minimo=$5,
          ubicacion=$6,
          precio=$7,
          stock=$8,
          categoria=$9,
          proveedor=$10
        WHERE id=$11
        RETURNING *
        `,
        [
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
          req.params.id
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

  // ==========================
  // ELIMINAR PRODUCTO
  // ==========================

  router.delete("/:id", async (req, res) => {

    try {

      await pool.query(
        "DELETE FROM productos WHERE id=$1",
        [req.params.id]
      );

      res.json({
        ok: true
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};