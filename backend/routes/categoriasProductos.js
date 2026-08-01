const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  // ==========================
  // LISTAR CATEGORÍAS PRODUCTOS
  // ==========================

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT 
          id,
          nombre
        FROM categorias_productos
        ORDER BY nombre
      `);

      res.json(result.rows);


    } catch (err) {

      console.error("Error cargando categorías productos:", err);

      res.status(500).json({
        error: err.message
      });

    }

  });


  return router;

};
