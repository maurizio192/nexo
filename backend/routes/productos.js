const express = require("express");
const produccionService = require("../services/produccionService");

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
        error: err.message
      });

    }

  });

  // Ejecutar producción

  router.post("/producir", async (req, res) => {

    try {

      const { elaboracionId, cantidad } = req.body;

      const receta = await produccionService.producirElaboracion(
        pool,
        elaboracionId,
        cantidad
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

  return router;

};