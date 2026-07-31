const registrarEvento = require("./registrarEvento");


async function ejecutarDecisiones(decisiones, contexto) {

  if (!decisiones || decisiones.length === 0) {
    return [];
  }

  const acciones = [];

  for (const decision of decisiones) {

    switch (decision.accion) {


      case "PROPONER_PEDIDO":

        acciones.push({
          accion: "PROPONER_PEDIDO",
          resultado:
            "Pedido preparado. Esperando confirmación del chef."
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
    {
      usuario: "Sancho",
      accion: decision.accion,
      detalle: {
        prioridad: decision.prioridad,
        motivo: decision.motivo
      }
    }
  );

}

}
  return acciones;

}


module.exports = ejecutarDecisiones;
