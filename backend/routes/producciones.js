const express = require("express");
const produccionService = require("../services/produccionService");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM producciones ORDER BY fecha DESC"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  router.post("/producir", async (req, res) => {

    try {

      const { elaboracionId, cantidad, responsable } = req.body;

      const resultado =
        await produccionService.producirElaboracion(
          pool,
          elaboracionId,
          cantidad,
          responsable
        );

      res.status(201).json({ ok: true, ...resultado });

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  return router;

};
