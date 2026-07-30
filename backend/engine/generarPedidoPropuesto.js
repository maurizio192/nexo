function generarPedidoPropuesto(productosCriticos = [], proveedoresCriticos = []) {

  const pedidos = {};

  productosCriticos.forEach(producto => {

    const nombreProducto = producto.nombre.trim();


    const proveedorInfo = proveedoresCriticos.find(
      p => p.nombre.trim() === nombreProducto
    );


    const proveedor =
      proveedorInfo?.proveedor || "Sin proveedor asignado";


    if (!pedidos[proveedor]) {

      pedidos[proveedor] = {

        proveedor,

        productos: [],

        motivo: "Stock crítico detectado por Sancho"

      };

    }


    pedidos[proveedor].productos.push({

      nombre: nombreProducto,

      stock_actual: Number(producto.stock_actual),

      stock_minimo: Number(producto.stock_minimo),

      cantidad_propuesta:
        Math.max(
          Number(producto.stock_minimo) - Number(producto.stock_actual),
          0
        )

    });


  });


  return Object.values(pedidos);

}


module.exports = generarPedidoPropuesto;
