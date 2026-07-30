const express = require("express");
const NexoEngine = require("../engine/nexoEngine");
const sanchoProduccion = require("../engine/sanchoProduccion");
const generarRespuestaSancho = require("../engine/sanchoRespuesta");


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
  SELECT 
    nombre,
    categoria
  FROM tareas_produccion
  WHERE fecha = CURRENT_DATE
  AND estado='PENDIENTE'
  ORDER BY categoria,nombre
`);


const proveedoresCriticos = await pool.query(`
  SELECT
    p.nombre,
    pr.nombre AS proveedor
  FROM productos p
  LEFT JOIN proveedores pr
    ON p.proveedor_id = pr.id
  WHERE p.stock_actual <= p.stock_minimo
  ORDER BY pr.nombre, p.nombre
`);


      const eventos = await pool.query(`
        SELECT
          fecha,
          usuario,
          accion,
          detalle
        FROM eventos_nexo
        ORDER BY fecha DESC
        LIMIT 5
      `);

      const pedidosPendientes = await pool.query(`
  SELECT
    proveedor,
    estado
  FROM pedidos
  WHERE estado = 'Pendiente'
`);



const respuestaSancho = generarRespuestaSancho({

  estado,

  incidencias,

  eventos: eventos.rows,

  inicio,

  proveedoresCriticos: proveedoresCriticos.rows,

  pedidosPendientes: pedidosPendientes.rows

});
      res.json({

        respuestaSancho,

        inicio,

        estado,

        incidencias,

        servicioHoy,

        produccion: produccion.rows,

        eventos: eventos.rows

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
