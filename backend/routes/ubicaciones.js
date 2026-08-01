const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  // ==========================
  // LISTAR UBICACIONES
  // ==========================

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT 
          id,
          nombre
        FROM ubicaciones
        ORDER BY nombre
      `);

      res.json(result.rows);


    } catch (err) {

      console.error("Error cargando ubicaciones:", err);

      res.status(500).json({
        error: err.message
      });

    }

  });


  return router;

};

