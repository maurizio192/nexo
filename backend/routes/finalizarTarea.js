const express = require("express");
const finalizarTarea = require("../engine/finalizarTarea");

module.exports = (pool) => {

  const router = express.Router();

  router.post("/", async (req, res) => {

    try {

      const { nombre } = req.body;

      const resultado = await finalizarTarea(pool, nombre);

      if (resultado.length === 0) {

        return res.json({

          ok: false,

          mensaje: "No encontré esa tarea."

        });

      }

      res.json({

        ok: true,

        mensaje: `${nombre} completado.`

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        ok: false,

        error: err.message

      });

    }

  });

  return router;

};