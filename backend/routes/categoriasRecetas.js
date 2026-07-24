const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // Lista de categorías del Libro de Recetas

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          id,
          nombre,
          icono,
          orden
        FROM categorias_recetas
        WHERE activa = TRUE
        ORDER BY orden
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