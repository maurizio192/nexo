function generarPrioridades(incidencias) {

  if (!incidencias || incidencias.length === 0) {
    return [];
  }

  const prioridades = [];

  incidencias.forEach(producto => {

    const stock = Number(producto.stock_actual);
    const minimo = Number(producto.stock_minimo);

    if (stock === 0 && minimo > 0) {

      prioridades.push({
        nivel: "URGENTE",
        producto: producto.nombre,
        mensaje: `${producto.nombre} está sin stock`
      });

    } else if (stock < minimo) {

      prioridades.push({
        nivel: "ATENCION",
        producto: producto.nombre,
        mensaje: `${producto.nombre} está bajo mínimo`
      });

    }

  });

  return prioridades;

}


function generarRespuestaSancho({
  estado,
  incidencias,
  eventos,
  inicio,
  proveedoresCriticos,
  pedidosPendientes
}) {

  console.log("SANCHO V2 CARICATO");
  console.log("SANCHO FILE NUOVO ATTIVO 123");

  let mensaje = "Oído, chef Maurizio. ";

  mensaje += "He revisado la situación de la cocina. ";

  const prioridades = generarPrioridades(incidencias);

  // PEDIDOS
  if (estado.pedidos > 0) {

    mensaje += `Hay ${estado.pedidos} pedidos pendientes por gestionar. `;

  } else {

    mensaje += "No hay pedidos pendientes. ";

  }


  // STOCK
  if (estado.stockCritico > 0) {

    mensaje += `Atención: ${estado.stockCritico} productos están por debajo del stock mínimo. `;

  } else {

    mensaje += "El stock está bajo control. ";

  }


   // PRIORIDADES
  if (incidencias && incidencias.length > 0) {

    const productos = incidencias
      .slice(0, 3)
      .map(p => p.nombre)
      .join(", ");

    mensaje += `Las prioridades que requieren atención son: ${productos}. `;

  }

 if (prioridades.length > 0) {

  const urgentes = prioridades
    .filter(p => p.nivel === "URGENTE")
    .slice(0, 3)
    .map(p => p.producto)
    .join(", ");

  if (urgentes) {

    mensaje += `Prioridad urgente: ${urgentes}. `;

  }

}
// PROVEEDORES DE LOS PRODUCTOS CRÍTICOS
if (proveedoresCriticos && proveedoresCriticos.length > 0) {

  const grupos = {};

  proveedoresCriticos.forEach(p => {

    if (!p.proveedor) return;

    if (!grupos[p.proveedor]) {
      grupos[p.proveedor] = [];
    }

    grupos[p.proveedor].push(p.nombre);

  });

  const primerProveedor = Object.keys(grupos)[0];

  if (primerProveedor) {

    const productos = grupos[primerProveedor]
      .slice(0, 3)
      .join(", ");

    mensaje += `El proveedor ${primerProveedor} debe suministrar: ${productos}. `;

  }

}

// PEDIDOS YA EXISTENTES
if (proveedoresCriticos && pedidosPendientes) {

  const proveedoresConPedido = pedidosPendientes.map(p => p.proveedor);

  const primerProveedor = proveedoresCriticos[0]?.proveedor;

  if (primerProveedor) {

    if (proveedoresConPedido.includes(primerProveedor)) {

      mensaje += `El proveedor ${primerProveedor} ya tiene un pedido pendiente. `;

    } else {

      mensaje += `El proveedor ${primerProveedor} no tiene pedidos pendientes. Se recomienda crear uno. `;

    }

  }

}

// EVENTOS
if (eventos && eventos.length > 0) {
    const ultimo = eventos[0];

   const hora = new Date(ultimo.fecha)
  .toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });


   mensaje += `La última operación registrada es ${ultimo.accion} a las ${hora}. `;

  }



  // TURNO
  if (inicio && inicio.turno) {

   mensaje += `Turno actual: ${inicio.turno}.`;

  }


  return mensaje;

}


module.exports = generarRespuestaSancho;
