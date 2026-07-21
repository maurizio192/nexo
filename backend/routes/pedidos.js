const express = require("express");
const pedidosService = require("../services/pedidosService");

module.exports = (pool) => {

  const router = express.Router();

  // Productos pendientes de pedir
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

  // Pedidos pendientes
  router.get("/pendientes", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          p.id,
          p.fecha,
          p.proveedor,
          p.estado,
          d.producto,
          d.cantidad
        FROM pedidos p
        JOIN pedido_detalle d
          ON p.id = d.pedido_id
        WHERE p.estado = 'Pendiente'
        ORDER BY p.id, d.producto
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

// ← PEGAR AQUÍ

router.post("/recibir", async (req, res) => {

  try {

    const { pedidoId } = req.body;

    await pedidosService.recibirPedido(
      pool,
      pedidoId
    );

    res.json({
      ok: true,
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