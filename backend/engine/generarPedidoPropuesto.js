function generarPedidoPropuesto(productosCriticos = []) {

  const pedidos = {};

  productosCriticos.forEach(producto => {

    const proveedor =
      producto.proveedor || "Sin proveedor asignado";

    if (!pedidos[proveedor]) {

      pedidos[proveedor] = {
        proveedor,
        productos: [],
        motivo: "Stock crítico detectado por Sancho"
      };

    }

    pedidos[proveedor].productos.push({

      nombre: producto.nombre,

      stock_actual: Number(producto.stock_actual),

      stock_minimo: Number(producto.stock_minimo),

      cantidad_propuesta:
        Math.max(
          Number(producto.stock_minimo) -
          Number(producto.stock_actual),
          0
        )

    });

  });

  return Object.values(pedidos);

}

module.exports = generarPedidoPropuesto;