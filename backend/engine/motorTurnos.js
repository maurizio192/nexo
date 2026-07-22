module.exports = function obtenerTurno() {

  const ahora = new Date();

  const hora =
    ahora.getHours() +
    ahora.getMinutes() / 60;

  if (hora >= 8 && hora < 13) {

    return "PRODUCCION_MANANA";

  }

  if (hora >= 13 && hora < 17) {

    return "SERVICIO_MEDIODIA";

  }

  if (hora >= 17 && hora < 20) {

    return "PRODUCCION_TARDE";

  }

  return "SERVICIO_NOCHE";

};