const express = require("express");
const NexoEngine = require("../engine/nexoEngine");
const sanchoProduccion = require("../engine/sanchoProduccion");

module.exports = (pool) => {

  const router = express.Router();
  const engine = new NexoEngine(pool);

  router.get("/", async (req, res) => {

    try {

      const inicio = await engine.ejecutar("INICIO_JORNADA");
      const estado = await engine.ejecutar("ESTADO_GENERAL");
      const incidencias = await engine.ejecutar("INCIDENCIAS_STOCK");
      const servicioHoy = await engine.ejecutar("SERVICIO_HOY");

      const produccion = await pool.query(`
        SELECT nombre,categoria
        FROM tareas_produccion
        WHERE fecha = CURRENT_DATE
        AND estado='PENDIENTE'
        ORDER BY categoria,nombre
      `);

      const mensaje = sanchoProduccion(produccion.rows);

      const recomendaciones = [];

      if (incidencias.length > 0) {

        recomendaciones.push(
          `Tienes ${incidencias.length} productos por debajo del stock mínimo.`
        );

      }

      res.json({

        saludo: "Hola.",

        mensaje,

        servicioHoy,

        estado,

        incidencias,

        recomendaciones,

        inicio

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