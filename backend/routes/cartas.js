const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // Obtener todas las cartas
  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM cartas ORDER BY id"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // Crear una carta
  router.post("/", async (req, res) => {

    try {

      const {
        nombre,
        tipo,
        descripcion
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO cartas
        (nombre, tipo, descripcion)
        VALUES ($1,$2,$3)
        RETURNING *;
        `,
        [
          nombre,
          tipo,
          descripcion
        ]
      );

      res.status(201).json(result.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // Obtener elaboraciones de una carta
  router.get("/:id/elaboraciones", async (req, res) => {

    try {

      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          e.id,
          e.nombre,
          CASE
            WHEN ce.id IS NULL THEN false
            ELSE true
          END AS seleccionada
        FROM elaboraciones e

        LEFT JOIN carta_elaboraciones ce
        ON e.id = ce.elaboracion_id
        AND ce.carta_id = $1

        ORDER BY e.nombre;
        `,
        [id]
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // Añadir elaboración a una carta
  router.post("/:id/elaboraciones", async (req, res) => {

    try {

      const { id } = req.params;
      const { elaboracionId } = req.body;

      const result = await pool.query(
        `
        INSERT INTO carta_elaboraciones
        (carta_id, elaboracion_id)
        VALUES ($1,$2)
        RETURNING *;
        `,
        [
          id,
          elaboracionId
        ]
      );

      res.json(result.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};