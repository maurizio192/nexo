async function crearPedidoAutomatico(pool, pedidosPropuestos = []) {

  console.log("===== CREAR PEDIDO AUTOMATICO =====");
  console.log(JSON.stringify(pedidosPropuestos, null, 2));

  const pedidosCreados = [];

  for (const pedido of pedidosPropuestos) {

    console.log("Procesando proveedor:", pedido.proveedor);
    console.log("Productos:", pedido.productos.length);

    if (!pedido.productos.length) continue;


    // Buscar pedido pendiente existente del proveedor

    const existente = await pool.query(
      `
      SELECT id
      FROM pedidos
      WHERE proveedor = $1
      AND estado = 'Pendiente'
      LIMIT 1
      `,
      [
        pedido.proveedor
      ]
    );


    // SI YA EXISTE NO TOCARLO

    if (existente.rows.length > 0) {

      console.log(
        "Pedido ya existente:",
        existente.rows[0].id
      );


      pedidosCreados.push({

        pedido_id: existente.rows[0].id,
        proveedor: pedido.proveedor,
        productos: 0,
        estado: "EXISTENTE"

      });


      continue;

    }



    // CREAR NUEVO PEDIDO

    const nuevo = await pool.query(
      `
      INSERT INTO pedidos
      (
        proveedor,
        estado,
        fecha
      )
      VALUES
      (
        $1,
        'Pendiente',
        NOW()
      )
      RETURNING id
      `,
      [
        pedido.proveedor
      ]
    );


    const pedidoId = nuevo.rows[0].id;



    // CREAR DETALLE DEL PEDIDO

    for (const producto of pedido.productos) {


      await pool.query(
        `
        INSERT INTO pedido_detalle
        (
          pedido_id,
          producto,
          cantidad
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        `,
        [
          pedidoId,
          producto.nombre,
          producto.cantidad_propuesta
        ]
      );


    }



    pedidosCreados.push({

      pedido_id: pedidoId,
      proveedor: pedido.proveedor,
      productos: pedido.productos.length,
      estado: "CREADO"

    });


  }



  console.log("PEDIDOS CREADOS:");
  console.log(
    JSON.stringify(pedidosCreados, null, 2)
  );


  return pedidosCreados;

}


module.exports = crearPedidoAutomatico;