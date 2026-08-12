const express = require("express");

const NexoEngine = require("../engine/nexoEngine");
const MotorPedidos = require("../engine/MotorPedidos");
const MotorStock = require("../engine/MotorStock");

const generarRespuestaSancho =
  require("../engine/sanchoRespuesta");

const evaluarEstadoCocina =
  require("../engine/motorEstadoCocina");

const generarDecisionesSancho =
  require("../engine/sanchoDecisiones");

const ejecutarDecisiones =
  require("../engine/ejecutorDecisiones");

const generarPedidoPropuesto =
  require("../engine/generarPedidoPropuesto");

const SanchoChat =
  require("../engine/sanchoChat");


module.exports = (pool) => {

  const router = express.Router();

  // ======================================
  // MOTORES
  // ======================================

  const engine =
    new NexoEngine(pool);

  const motorStock =
    new MotorStock(pool);

  const motorPedidos =
    new MotorPedidos(pool);

  const sanchoChat =
    new SanchoChat(pool);


  // ======================================
  // SANCHO CHAT
  // ======================================

  router.post("/chat", async (req, res) => {

    try {

      const { pregunta } = req.body;

      const resultado =
        await sanchoChat.procesar(pregunta);

      res.json(resultado);

    } catch (err) {

      console.error(
        "ERROR SANCHO CHAT:",
        err
      );

      res.status(500).json({
        error: err.message
      });

    }

  });


  // ======================================
  // ESTADO GENERAL DE SANCHO
  // ======================================

  router.get("/", async (req, res) => {

    try {

      // ======================================
      // INICIO DE JORNADA
      // ======================================

      const inicio =
        await engine.ejecutar(
          "INICIO_JORNADA"
        );


      // ======================================
      // ESTADO GENERAL
      // ======================================

      const estado =
        await engine.ejecutar(
          "ESTADO_GENERAL"
        );


      // ======================================
      // INCIDENCIAS DE STOCK
      // ======================================

      const incidencias =
        await engine.ejecutar(
          "INCIDENCIAS_STOCK"
        );


      // ======================================
      // SERVICIO DE HOY
      // ======================================

      const servicioHoy =
        await engine.ejecutar(
          "SERVICIO_HOY"
        );


      // ======================================
      // PRODUCTOS CRÍTICOS
      // ======================================

      const proveedoresCriticos =
        await motorStock.obtenerProductosCriticos();


      // ======================================
      // PRODUCCIÓN DE HOY
      // ======================================

      const produccion =
        await pool.query(`
          SELECT
            nombre,
            categoria
          FROM tareas_produccion
          WHERE fecha = CURRENT_DATE
            AND estado = 'PENDIENTE'
          ORDER BY categoria, nombre
        `);


      // ======================================
      // ÚLTIMOS EVENTOS
      // ======================================

      const eventos =
        await pool.query(`
          SELECT
            fecha,
            usuario,
            accion,
            detalle
          FROM eventos_nexo
          ORDER BY fecha DESC
          LIMIT 5
        `);


      // ======================================
      // PEDIDOS PENDIENTES
      // ======================================

      const pedidosPendientes =
        await pool.query(`
          SELECT
            id,
            proveedor,
            estado
          FROM pedidos
          WHERE estado = 'Pendiente'
        `);


      // ======================================
      // MOTOR DE PROPUESTA DE PEDIDO
      //
      // Sancho analiza.
      // Sancho propone.
      // NO ENVÍA PEDIDOS.
      // ======================================

      const productosCriticos =
        incidencias.rows || incidencias || [];
        
console.log("===== SANCHO PRODUCTOS CRÍTICOS =====");
console.log("TOTAL:", productosCriticos.length);

console.dir(
  productosCriticos.find(p => p.id === 31),
  { depth: null }
);

      const pedidosPropuestos =
        generarPedidoPropuesto(
          productosCriticos
        );


      // ======================================
      // PEDIDOS GENERADOS
      //
      // Solo se generan cuando:
      //
      // ?confirmar=1
      //
      // ======================================

      let pedidosGenerados = [];


      if (req.query.confirmar === "1") {

        pedidosGenerados =
          await motorPedidos.generarPedidosAutomaticos();

      }


      // ======================================
      // MOTOR DE ESTADO DE COCINA
      // ======================================

      const motorEstado =
        evaluarEstadoCocina({

          estado,

          incidencias,

          inicio,

          eventos:
            eventos.rows,

          proveedoresCriticos,

          pedidosPendientes:
            pedidosPendientes.rows

        });


      // ======================================
      // DECISIONES DE SANCHO
      // ======================================

      const decisiones =
        generarDecisionesSancho({

          estado,

          incidencias,

          inicio,

          pedidosPendientes:
            pedidosPendientes.rows,

          proveedoresCriticos

        });


      // ======================================
      // EJECUTAR DECISIONES
      // ======================================

      const acciones =
        await ejecutarDecisiones(

          decisiones,

          {
            pool
          }

        );


      // ======================================
      // RESPUESTA INTELIGENTE DE SANCHO
      // ======================================

      const respuestaSancho =
        generarRespuestaSancho({

          motorEstado,

          decisiones,

          estado,

          incidencias,

          eventos:
            eventos.rows,

          inicio,

          proveedoresCriticos,

          pedidosPendientes:
            pedidosPendientes.rows

        });


      // ======================================
      // RESPUESTA API
      // ======================================

      res.json({

        respuestaSancho,

        pedidosPropuestos,

        pedidosGenerados,

        motorEstado,

        decisiones,

        acciones,

        inicio,

        estado,

        incidencias,

        servicioHoy,

        produccion:
          produccion.rows,

        eventos:
          eventos.rows

      });


    } catch (err) {

      console.error(
        "ERROR SANCHO:",
        err
      );

      res.status(500).json({
        error: err.message
      });

    }

  });


  // ======================================
  // DEVOLVER ROUTER
  // ======================================

  return router;

};
