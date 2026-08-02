const express = require("express");

const NexoEngine = require("../engine/nexoEngine");
const generarRespuestaSancho = require("../engine/sanchoRespuesta");
const evaluarEstadoCocina = require("../engine/motorEstadoCocina");
const generarDecisionesSancho = require("../engine/sanchoDecisiones");
const ejecutarDecisiones = require("../engine/ejecutorDecisiones");
const generarPedidoPropuesto = require("../engine/generarPedidoPropuesto");


module.exports = (pool) => {

  const router = express.Router();

  const engine = new NexoEngine(pool);



  router.get("/", async (req, res) => {

    try {


      const inicio = await engine.ejecutar(
        "INICIO_JORNADA"
      );


      const estado = await engine.ejecutar(
        "ESTADO_GENERAL"
      );


      const incidencias = await engine.ejecutar(
        "INCIDENCIAS_STOCK"
      );


      const servicioHoy = await engine.ejecutar(
        "SERVICIO_HOY"
      );



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
        ORDER BY pr.nombre,p.nombre
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
          id,
          proveedor,
          estado
        FROM pedidos
        WHERE estado='Pendiente'
      `);



      /*
        MOTOR PROPUESTA PEDIDO

        Sancho analiza.
        Sancho propone.
        NO ENVÍA PEDIDOS.
      */


      const productosCriticos =
        incidencias.rows || incidencias;



      const pedidosPropuestos =
        generarPedidoPropuesto(productosCriticos);



      /*
        PEDIDOS GENERADOS

        Vacío hasta que el usuario diga:

        "Sancho manda pedido"

      */


      let pedidosGenerados = [];

if (req.query.confirmar === "1") {

  pedidosGenerados = await engine.ejecutar(
    "CREAR_PEDIDOS_AUTOMATICOS",
    {
      pedidosPropuestos
    }
  );

}





      const motorEstado =
        evaluarEstadoCocina({

          estado,

          incidencias,

          inicio,

          eventos:eventos.rows,

          proveedoresCriticos:
            proveedoresCriticos.rows,

          pedidosPendientes:
            pedidosPendientes.rows

        });






      const decisiones =
        generarDecisionesSancho({

          estado,

          incidencias,

          inicio,

          pedidosPendientes:
            pedidosPendientes.rows,

          proveedoresCriticos:
            proveedoresCriticos.rows

        });





      const acciones =
        await ejecutarDecisiones(

          decisiones,

          {
            pool
          }

        );






      const respuestaSancho =
        generarRespuestaSancho({

          motorEstado,

          decisiones,

          estado,

          incidencias,

          eventos:eventos.rows,

          inicio,

          proveedoresCriticos:
            proveedoresCriticos.rows,

          pedidosPendientes:
            pedidosPendientes.rows

        });







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



    } catch(err){


      console.error(err);


      res.status(500).json({

        error:err.message

      });


    }


  });



  return router;

};