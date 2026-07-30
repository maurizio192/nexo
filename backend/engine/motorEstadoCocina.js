function evaluarEstadoCocina({

  estado,
  incidencias,
  inicio,
  eventos,
  pedidosPendientes,
  proveedoresCriticos

}) {

  const motor = {

    modo: "NORMAL",
    estado: "OPERATIVA",
    prioridad: "NINGUNA",
    nivel: "VERDE",
    mensaje: "Todo funciona correctamente."

  };

  // ==========================
  // MODO DE TRABAJO
  // ==========================

 if (inicio?.turno?.startsWith("PRODUCCION")) {

    motor.modo = "PREPARACION";

} else if (inicio?.turno?.startsWith("SERVICIO")) {

    motor.modo = "SERVICIO";

} else {

    motor.modo = "NORMAL";

}
  // ==========================
  // STOCK CRÍTICO
  // ==========================

  const urgentes = incidencias.filter(p => Number(p.stock_actual) === 0);

  if (urgentes.length > 0) {

    motor.estado = "RIESGO_OPERATIVO";
    motor.prioridad = "STOCK";
    motor.nivel = "ROJO";
    motor.mensaje = "Existen productos sin stock.";

  } else if (incidencias.length > 0) {

    motor.estado = "OPERATIVA_CON_INCIDENCIAS";
    motor.prioridad = "STOCK";
    motor.nivel = "AMARILLO";
    motor.mensaje = "Existen productos por debajo del mínimo.";

  }

  // ==========================
  // PEDIDOS
  // ==========================

  if (
    motor.nivel === "VERDE" &&
    pedidosPendientes.length > 0
  ) {

    motor.prioridad = "PEDIDOS";

  }

  return motor;

}

module.exports = evaluarEstadoCocina;