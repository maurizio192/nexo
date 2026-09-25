const express = require("express");
const mermaService = require("../services/mermaService");
const productoService = require("../services/productoService");

module.exports = (pool) => {

  const router = express.Router();

  /*
  |--------------------------------------------------------------------------
  | ESTADISTICAS ACUMULADAS (producto_id + lavorazione, media ponderada)
  |--------------------------------------------------------------------------
  | Se declara antes que "/:id" para que no la capture como id.
  */
  router.get("/estadisticas", async (req, res) => {

    try {

      const estadisticas = await mermaService.obtenerEstadisticas(
        pool,
        {
          producto_id: req.query.producto_id,
          lavorazione: req.query.lavorazione
        }
      );

      res.json(estadisticas);

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | HISTORIAL DE RILEVAZIONES
  |--------------------------------------------------------------------------
  */
  router.get("/", async (req, res) => {

    try {

      const mermas = await mermaService.listarMermas(
        pool,
        {
          producto_id: req.query.producto_id,
          lavorazione: req.query.lavorazione,
          estado: req.query.estado,
          desde: req.query.desde,
          hasta: req.query.hasta,
          limite: req.query.limite
        }
      );

      res.json(mermas);

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | LAVORAZIONES YA REGISTRADAS (texto libre, para autocompletar)
  |--------------------------------------------------------------------------
  */
  router.get("/lavorazioni", async (req, res) => {

    try {

      const lavorazioni = await mermaService.obtenerLavorazioni(
        pool,
        req.query.producto_id
      );

      res.json(lavorazioni);

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | BUSCAR PRODUCTOS (para el formulario MERME)
  |--------------------------------------------------------------------------
  */
  router.get("/productos", async (req, res) => {

    try {

      const productos = await productoService.buscarProductos(
        pool,
        req.query.q,
        req.query.limite || 5
      );

      res.json(productos);

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | REGISTRAR RILEVAZIONE DE MERMA
  |--------------------------------------------------------------------------
  */
  router.post("/", async (req, res) => {

    try {

      const merma = await mermaService.registrarMerma(pool, req.body);

      res.status(201).json({ ok: true, merma });

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | ANULAR RILEVAZIONE (soft state, NO se borra)
  |--------------------------------------------------------------------------
  */
  router.put("/:id/anular", async (req, res) => {

    try {

      const merma = await mermaService.anularMerma(
        pool,
        req.params.id,
        {
          responsable: req.body?.responsable,
          motivo: req.body?.motivo
        }
      );

      res.json({ ok: true, merma });

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  /*
  |--------------------------------------------------------------------------
  | OBTENER UNA RILEVAZIONE
  |--------------------------------------------------------------------------
  */
  router.get("/:id", async (req, res) => {

    try {

      const merma = await mermaService.obtenerMerma(pool, req.params.id);

      res.json(merma);

    } catch (err) {

      console.error(err);

      res.status(err.statusCode || 500).json({
        error: err.public ? err.message : "Error interno del servidor"
      });

    }

  });

  return router;

};