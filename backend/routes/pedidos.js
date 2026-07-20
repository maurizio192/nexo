const express = require("express");
const pedidosService = require("../services/pedidosService");

module.exports = (pool) => {

  const router = express.Router();

  // Productos que necesitan pedido
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
        ORDER BY proveedor, nombre
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

      const pedidoId = await pedidosService.generarPedido(
        pool,
        proveedor
      );

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