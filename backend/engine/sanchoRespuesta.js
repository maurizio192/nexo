function generarRespuestaSancho({
  estado,
  incidencias,
  eventos,
  inicio
}) {


  console.log("SANCHO V2 CARICATO");
  console.log("SANCHO FILE NUOVO ATTIVO 123");

  let mensaje = "Oído chef Maurizio. ";

  mensaje += "Ho controllato la situazione della cucina. ";


  // ORDINI
  if (estado.pedidos > 0) {

    mensaje += `Ci sono ${estado.pedidos} ordini pendenti da gestire. `;

  } else {

    mensaje += "Non ci sono ordini pendenti. ";

  }



  // STOCK
  if (estado.stockCritico > 0) {

    mensaje += `Attenzione: ${estado.stockCritico} prodotti sono sotto il livello minimo. `;

  } else {

    mensaje += "Lo stock è sotto controllo. ";

  }



  // PRIORITÀ
  if (incidencias && incidencias.length > 0) {

    const prodotti = incidencias
      .slice(0, 3)
      .map(p => p.nombre)
      .join(", ");


    mensaje += `Le priorità da controllare sono: ${prodotti}. `;

  }



  // EVENTI
  if (eventos && eventos.length > 0) {

    const ultimo = eventos[0];

    const ora = new Date(ultimo.fecha)
      .toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
      });


    mensaje += `L'ultima operazione registrata è ${ultimo.accion} alle ore ${ora}. `;

  }



  // TURNO
  if (inicio && inicio.turno) {

    mensaje += `Turno attuale: ${inicio.turno}.`;

  }


  return mensaje;

}


module.exports = generarRespuestaSancho;
