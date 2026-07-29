const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT
          p.id,
          p.nombre,
          p.stock_actual,
          p.stock_minimo,
          pr.id AS proveedor_id,
          pr.nombre AS proveedor
        FROM productos p
        JOIN proveedores pr
          ON p.proveedor_id = pr.id
        WHERE p.stock_actual <= p.stock_minimo
        ORDER BY pr.nombre, p.nombre
      `);

      res.json(resultado.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};