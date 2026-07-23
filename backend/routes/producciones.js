const express = require("express");
const produccionService = require("../services/produccionService");
const consumirReceta = require("../engine/consumirReceta");

module.exports = (pool) => {

  const router = express.Router();

  // Listar producciones

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM producciones ORDER BY fecha DESC"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });
await consumirReceta(
    pool,
    elaboracion_id,
    cantidad
);
  // Ejecutar producción

  router.post("/producir", async (req, res) => {

    try {

      const { elaboracionId } = req.body;

      const receta = await produccionService.producirElaboracion(
        pool,
        elaboracionId
      );

      res.json(receta);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  return router;

};