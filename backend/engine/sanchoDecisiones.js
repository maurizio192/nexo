function generarDecisiones({
  estado,
  incidencias,
  inicio,
  pedidosPendientes,
  proveedoresCriticos
}) {

  const decisiones = [];


  // PRIORITÀ 1 - Stock critico
  if (incidencias && incidencias.some(p => Number(p.stock_actual) === 0)) {

    const productosCriticos = incidencias
      .filter(p => Number(p.stock_actual) <= Number(p.stock_minimo))
      .map(p => ({
        nombre: p.nombre,
        stock_actual: Number(p.stock_actual),
        stock_minimo: Number(p.stock_minimo)
      }));


    const proveedores = [];


    if (proveedoresCriticos && proveedoresCriticos.length > 0) {

      proveedoresCriticos.forEach(p => {

        if (p.proveedor && !proveedores.includes(p.proveedor)) {
          proveedores.push(p.proveedor);
        }

      });

    }


    decisiones.push({

      prioridad: 1,

      accion: "GENERAR_PEDIDOS",

      motivo: "Existen productos sin stock.",

      productos: productosCriticos,

      proveedores

    });

  }



  // PRIORITÀ 2 - Producciones
  if (inicio?.elaboraciones?.length > 0) {

    decisiones.push({

      prioridad: 2,

      accion: "PRODUCIR",

      motivo: "Hay elaboraciones por debajo del mínimo.",

      elaboraciones: inicio.elaboraciones

    });

  }



  // PRIORITÀ 3 - Pedidos
  if (pedidosPendientes?.length > 0) {

    decisiones.push({

      prioridad: 3,

      accion: "REVISAR_PEDIDOS",

      motivo: "Existen pedidos pendientes.",

      pedidos: pedidosPendientes

    });

  }



  // PRIORITÀ 99 - Todo correcto
  if (decisiones.length === 0) {

    decisiones.push({

      prioridad: 99,

      accion: "CONTINUAR_SERVICIO",

      motivo: "No existen incidencias."

    });

  }


  return decisiones.sort((a, b) =>
    a.prioridad - b.prioridad
  );

}


module.exports = generarDecisiones;