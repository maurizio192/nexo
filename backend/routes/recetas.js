const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // Lista de recetas

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT
          id,
          codigo,
          nombre,
          categoria
        FROM recetas
        WHERE activa = TRUE
        ORDER BY categoria, nombre
      `);

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // Receta completa

  router.get("/:id", async (req, res) => {

    try {

      const receta = await pool.query(`
        SELECT *
        FROM recetas
        WHERE id = $1
      `, [req.params.id]);

      const ingredientes = await pool.query(`
        SELECT *
        FROM receta_ingredientes
        WHERE receta_id = $1
        ORDER BY orden
      `, [req.params.id]);

      res.json({

        receta: receta.rows[0],

        ingredientes: ingredientes.rows

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};