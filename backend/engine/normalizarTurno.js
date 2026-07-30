module.exports = function normalizarTurno(turno) {

  if (!turno) return "SERVICIO";

  if (turno.startsWith("PRODUCCION")) {
    return "PREPARACION";
  }

  if (turno.startsWith("SERVICIO")) {
    return "SERVICIO";
  }

  return "CIERRE";

};

