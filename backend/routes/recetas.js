const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  /*
  |--------------------------------------------------------------------------
  | LISTA DE RECETAS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | RECETA COMPLETA
  |--------------------------------------------------------------------------
  */
// Categorías del libro de recetas

router.get("/categorias/lista", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        categoria,
        COUNT(*) AS total
      FROM recetas
      WHERE activa = TRUE
      GROUP BY categoria
      ORDER BY categoria
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
router.get("/categoria/:categoria", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        id,
        nombre
      FROM recetas
      WHERE categoria = $1
      AND activa = TRUE
      ORDER BY nombre
      `,
      [req.params.categoria]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

  router.get("/:id", async (req, res) => {

    try {

      const receta = await pool.query(
        `
        SELECT *
        FROM recetas
        WHERE id = $1
        `,
        [req.params.id]
      );

      const ingredientes = await pool.query(
        `
        SELECT *
        FROM receta_ingredientes
        WHERE receta_id = $1
        ORDER BY orden
        `,
        [req.params.id]
      );

      const pasos = await pool.query(
        `
        SELECT *
        FROM receta_pasos
        WHERE receta_id = $1
        ORDER BY orden
        `,
        [req.params.id]
      );

      res.json({

        receta: receta.rows[0],

        ingredientes: ingredientes.rows,

        pasos: pasos.rows

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