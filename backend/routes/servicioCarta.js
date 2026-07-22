const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          s.id,
          s.fecha,
          s.turno,
          c.nombre AS carta
        FROM servicios_carta s
        JOIN cartas c
          ON c.id = s.carta_id
        WHERE s.fecha = CURRENT_DATE
        ORDER BY s.turno
        LIMIT 1
      `);

      res.json(result.rows[0] || null);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};