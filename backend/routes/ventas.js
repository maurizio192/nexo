const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.post("/", async (req, res) => {

    try {

      const {
        fecha,
        turno,
        elaboracion,
        cantidad
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO ventas_servicio
        (fecha, turno, elaboracion, cantidad)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
        [
          fecha,
          turno,
          elaboracion,
          cantidad
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

  return router;

};