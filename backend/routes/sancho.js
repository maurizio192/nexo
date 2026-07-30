const express = require("express");

const NexoEngine = require("../engine/nexoEngine");
const sanchoProduccion = require("../engine/sanchoProduccion");
const generarRespuestaSancho = require("../engine/sanchoRespuesta");
const evaluarEstadoCocina = require("../engine/motorEstadoCocina");
const generarDecisionesSancho = require("../engine/sanchoDecisiones");
const ejecutarDecisiones = require("../engine/ejecutorDecisiones");


module.exports = (pool) => {

  const router = express.Router();

  const engine = new NexoEngine(pool);



  router.get("/", async (req, res) => {

    try {


      // ESTADO INICIAL DE LA JORNADA

      const inicio = await engine.ejecutar("INICIO_JORNADA");


      // ESTADO GENERAL

      const estado = await engine.ejecutar("ESTADO_GENERAL");


      // INCIDENCIAS STOCK

      const incidencias = await engine.ejecutar("INCIDENCIAS_STOCK");



      // SERVICIO ACTUAL

      const servicioHoy = await engine.ejecutar("SERVICIO_HOY");



      // PRODUCCIÓN PENDIENTE

      const produccion = await pool.query(`
        SELECT 
          nombre,
          categoria
        FROM tareas_produccion
        WHERE fecha = CURRENT_DATE
        AND estado='PENDIENTE'
        ORDER BY categoria,nombre
      `);



      // PRODUCTOS CRÍTICOS + PROVEEDOR

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



      // EVENTOS RECIENTES

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



      // PEDIDOS PENDIENTES

      const pedidosPendientes = await pool.query(`
        SELECT
          proveedor,
          estado
        FROM pedidos
        WHERE estado = 'Pendiente'
      `);




      // MOTOR DE ESTADO COCINA

      const motorEstado = evaluarEstadoCocina({

        estado,

        incidencias,

        inicio,

        eventos: eventos.rows,

        proveedoresCriticos: proveedoresCriticos.rows,

        pedidosPendientes: pedidosPendientes.rows

      });




      // MOTOR DE DECISIONES SANCHO

     const decisiones = generarDecisionesSancho({

  estado,

  incidencias,

  inicio,

  pedidosPendientes: pedidosPendientes.rows,

  proveedoresCriticos: proveedoresCriticos.rows

});

      const acciones = await ejecutarDecisiones(
  decisiones,
  {
    pool
  }
);





      // RESPUESTA HUMANA DE SANCHO

      const respuestaSancho = generarRespuestaSancho({

        motorEstado,

        decisiones,

        estado,

        incidencias,

        eventos: eventos.rows,

        inicio,

        proveedoresCriticos: proveedoresCriticos.rows,

        pedidosPendientes: pedidosPendientes.rows

      });





res.json({

  respuestaSancho,

  motorEstado,

  decisiones,

  acciones,

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