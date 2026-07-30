const sanchoFrases = {

  saludos: {
    manana: "Buenos días, chef.",
    tarde: "Buenas tardes, chef.",
    noche: "Buenas noches, chef."
  },


  confirmaciones: {
    recibido: "Oído, chef.",
    registrado: "Registrado, chef.",
    completado: "Trabajo completado, chef."
  },


  briefing: {

    preparacion:
      "Estamos en modo preparación. Revisaré las tareas pendientes para dejar la cocina preparada.",

    servicio:
      "Estamos en modo servicio. Registraré la actividad del servicio y controlaré las incidencias.",

    cierre:
      "Estamos en cierre. Prepararé el resumen operativo del día."

  },


  alertas: {

    stockRojo:
      "Hay una incidencia de stock que requiere atención prioritaria.",

    stockAmarillo:
      "Hay productos que necesitan revisión.",

    correcto:
      "La situación operativa es correcta."

  },


  pedidos: {

    iniciar:
      "Preparando la gestión de pedidos.",

    generado:
      "Pedidos preparados y organizados por proveedor."

  },


  saludoActual: function() {

    const hora = new Date().getHours();

    if (hora < 14) {
      return this.saludos.manana;
    }

    if (hora < 21) {
      return this.saludos.tarde;
    }

    return this.saludos.noche;

  }

};


module.exports = sanchoFrases;