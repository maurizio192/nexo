const sanchoPersonalidad = {

  saludo: {
    manana: "Buenos días, chef.",
    tarde: "Buenas tardes, chef.",
    noche: "Buenas noches, chef."
  },

  confirmacion: {
    recibido: "Oído, chef.",
    terminado: "Trabajo registrado, chef."
  },

  modos: {

    PREPARACION:
      "Estamos en modo preparación. Revisaré las tareas necesarias para dejar la cocina lista.",

    SERVICIO:
      "Estamos en modo servicio. Registraré las comandas y controlaré la evolución del servicio.",

    CIERRE:
      "Estamos en cierre. Prepararé el resumen operativo del día."

  },

  estados: {

    VERDE:
      "La cocina está funcionando correctamente.",

    AMARILLO:
      "Hay algunos puntos que requieren atención.",

    ROJO:
      "Existe un riesgo operativo que necesita una acción."

  }

};


module.exports = sanchoPersonalidad;
