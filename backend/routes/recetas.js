const express = require("express");
const recetasService = require("../services/recetasService");
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

router.get("/categorias", async (req, res) => {

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
/*
|--------------------------------------------------------------------------
| PRODUCIR RECETA
|--------------------------------------------------------------------------
*/

router.post("/:id/producir", async (req, res) => {

  const { cantidad, responsable } = req.body;

  try {

    await pool.query("BEGIN");

    // Registrar la producción
    await pool.query(
      `
      INSERT INTO producciones
      (
        elaboracion,
        fecha,
        responsable,
        cantidad_bolsas,
        estado,
        elaboracion_id
      )
      VALUES
      (
        (SELECT nombre FROM recetas WHERE id = $1),
        NOW(),
        $2,
        $3,
        'COMPLETADA',
        $1
      )
      `,
      [
        req.params.id,
        responsable,
        cantidad
      ]
    );

    // Actualizar stock producido
    await pool.query(
      `
      UPDATE recetas
      SET unidades_producidas =
          COALESCE(unidades_producidas,0) + $1
      WHERE id = $2
      `,
      [
        cantidad,
        req.params.id
      ]
    );

    await pool.query("COMMIT");

    res.json({
      ok: true
    });

  } catch (err) {

    await pool.query("ROLLBACK");

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
/*
|--------------------------------------------------------------------------
| NUEVA RECETA
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {

  try {

    const receta = await recetasService.crear(
      pool,
      req.body
    );

    res.json({
      ok: true,
      receta
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
/*
|--------------------------------------------------------------------------
| AGREGAR INGREDIENTE A RECETA
|--------------------------------------------------------------------------
*/

router.post("/:id/ingredientes", async (req, res) => {

  try {

    const {
  productoId,
  cantidad,
  unidad,
  merma,
  descontar
} = req.body;
    // Obtener nombre del producto

    const producto = await pool.query(
      `
      SELECT nombre
      FROM productos
      WHERE id = $1
      `,
      [productoId]
    );

    await pool.query(
      `
      INSERT INTO receta_ingredientes
      (
        receta_id,
        ingrediente,
        cantidad,
        unidad,
        producto_id,
        merma,
        descontar,
        orden
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        (
          SELECT
          COALESCE(MAX(orden),0)+1
          FROM receta_ingredientes
          WHERE receta_id=$1
        )
      )
      `,
      [
        req.params.id,
        producto.rows[0].nombre,
        cantidad,
        unidad,
        producto_id,
        merma,
        descontar
      ]
    );

    res.json({
      ok: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
router.put("/:id/archivar", async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE recetas
      SET activa = FALSE
      WHERE id = $1
      `,
      [req.params.id]
    );

    res.json({ ok: true });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});
  return router;

};