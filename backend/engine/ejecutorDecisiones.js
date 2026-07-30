const registrarEvento = require("./registrarEvento");


async function ejecutarDecisiones(decisiones, contexto) {

  if (!decisiones || decisiones.length === 0) {
    return [];
  }

  const acciones = [];

  for (const decision of decisiones) {

    switch (decision.accion) {


      case "GENERAR_PEDIDOS":

        acciones.push({
          accion: "PROPONER_PEDIDO",
          resultado:
            "Preparar pedidos agrupados por proveedor."
        });

        break;



      case "PRODUCIR":

        acciones.push({
          accion: "PROPONER_PRODUCCION",
          resultado:
            "Revisar elaboraciones por debajo del mínimo."
        });

        break;



      case "REVISAR_PEDIDOS":

        acciones.push({
          accion: "REVISAR_ESTADO_PEDIDOS",
          resultado:
            "Comprobar pedidos pendientes con proveedores."
        });

        break;



      default:

        acciones.push({
          accion: decision.accion,
          resultado:
            "Acción no definida todavía."
        });

    }


    // Registro automático de la decisión

    if (contexto && contexto.pool) {

      await registrarEvento(
        contexto.pool,
        "Sancho",
        decision.accion,
        decision.motivo
      );

    }


  }


  return acciones;

}


module.exports = ejecutarDecisiones;