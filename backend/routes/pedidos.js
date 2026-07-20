const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // Ver productos pendientes

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          proveedor,
          nombre,
          stock_actual,
          stock_minimo
        FROM productos
        WHERE stock_actual <= stock_minimo
          AND proveedor IS NOT NULL
        ORDER BY proveedor,nombre
      `);

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  // Generar pedido

  router.post("/generar", async (req, res) => {

    try {

      const { proveedor } = req.body;

      // Crear pedido

      const pedido = await pool.query(
        `
        INSERT INTO pedidos
        (fecha, proveedor)
        VALUES (CURRENT_DATE,$1)
        RETURNING id
        `,
        [proveedor]
      );

      const pedidoId = pedido.rows[0].id;

      // Buscar productos

      const productos = await pool.query(
        `
        SELECT nombre,
               stock_actual,
               stock_minimo
        FROM productos
        WHERE proveedor=$1
          AND stock_actual<=stock_minimo
        `,
        [proveedor]
      );

      // Crear líneas

      for (const p of productos.rows) {

        const cantidad = p.stock_minimo - p.stock_actual + 1;

        await pool.query(
          `
          INSERT INTO pedido_detalle
          (pedido_id,producto,cantidad)
          VALUES ($1,$2,$3)
          `,
          [
            pedidoId,
            p.nombre,
            cantidad,
          ]
        );

      }

      res.json({

        ok: true,

        pedido: pedidoId,

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  return router;

};