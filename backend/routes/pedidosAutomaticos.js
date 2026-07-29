const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // ======================================
  // PEDIDOS AUTOMÁTICOS
  // ======================================

  router.get("/", async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT
          p.id,
          p.nombre,
          p.stock_actual,
          p.stock_minimo,
          p.stock_garantizado,
          (p.stock_garantizado - p.stock_actual) AS cantidad_pedir,
          pr.id AS proveedor_id,
          pr.nombre AS proveedor
        FROM productos p
        JOIN proveedores pr
          ON p.proveedor_id = pr.id
        WHERE p.stock_actual < p.stock_garantizado
        ORDER BY pr.nombre, p.nombre
      `);

      console.log("===== PEDIDOS AUTOMÁTICOS V2 =====");
      console.table(resultado.rows);

      res.json(resultado.rows);

    } catch (err) {

      console.error("ERROR PEDIDOS AUTOMÁTICOS:");
      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};