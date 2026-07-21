const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // Listar elaboraciones

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM elaboraciones ORDER BY nombre"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  // Crear elaboración

  router.post("/", async (req, res) => {

    try {

      const {
        nombre,
        categoria,
        dias_conservacion,
        tipo,
        activa,
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO elaboraciones
        (
          nombre,
          categoria,
          dias_conservacion,
          tipo,
          activa
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [
          nombre,
          categoria,
          dias_conservacion,
          tipo,
          activa,
        ]
      );

      res.status(201).json(result.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  // Descontar bolsas

  router.put("/:id/descontar", async (req, res) => {

    try {

      const { id } = req.params;
      const { cantidad } = req.body;

      const result = await pool.query(
        `
        UPDATE elaboraciones
        SET bolsas_actuales = bolsas_actuales - $1
        WHERE id = $2
        RETURNING *
        `,
        [
          cantidad,
          id,
        ]
      );

      res.json(result.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  return router;

};