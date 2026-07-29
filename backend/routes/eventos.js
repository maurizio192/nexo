const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          id,
          fecha,
          usuario,
          accion,
          detalle
        FROM eventos_nexo
        ORDER BY fecha DESC
        LIMIT 50
      `);

      res.json(result.rows);


    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });


  return router;

};
