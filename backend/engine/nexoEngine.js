class NexoEngine {

  constructor(pool) {
    this.pool = pool;
  }

  async ejecutar(accion, datos = {}) {

    switch (accion) {

      case "PRODUCIR":

        return await require("../services/produccionService")
          .producirElaboracion(
            this.pool,
            datos.elaboracionId
          );

      case "GENERAR_PEDIDO":

        return await require("../services/pedidosService")
          .generarPedido(
            this.pool,
            datos.proveedor
          );

      case "RECIBIR_PEDIDO":

        return await require("../services/pedidosService")
          .recibirPedido(
            this.pool,
            datos.pedidoId
          );

      case "INICIO_JORNADA":

        return await require("./inicioJornada")(
          this.pool
        );

      case "ESTADO_GENERAL":

        return await require("./estadoGeneral")(
          this.pool
        );

      case "INCIDENCIAS_STOCK":

        return await require("./incidenciasStock")(
          this.pool
        );
      case "SERVICIO_HOY":

      return await require("./servicioHoy")(
      this.pool
  );
      default:

        throw new Error(
          `Acción no soportada por Motor NEXO: ${accion}`
        );

    }

  }

}

module.exports = NexoEngine;