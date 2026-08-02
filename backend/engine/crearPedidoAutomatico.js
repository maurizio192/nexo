async function crearPedidoAutomatico(pool, pedidosPropuestos = []) {
console.log("=== CREAR PEDIDO AUTOMATICO ===");
console.log(JSON.stringify(pedidosPropuestos, null, 2));


  console.log("===== CREAR PEDIDO AUTOMATICO =====");

  const pedidosCreados = [];

  for (const pedido of pedidosPropuestos) {

    if (!pedido.productos.length) continue;

    // Buscar pedido pendiente

    const existente = await pool.query(
      `
      SELECT id
      FROM pedidos
      WHERE proveedor=$1
      AND estado='Pendiente'
      LIMIT 1
      `,
      [pedido.proveedor]
    );

    let pedidoId;
    let estado;

    if (existente.rows.length > 0) {

      pedidoId = existente.rows[0].id;
      estado = "ACTUALIZADO";

    } else {

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
        [pedido.proveedor]
      );

      pedidoId = nuevo.rows[0].id;
      estado = "CREADO";

    }

    let productosProcesados = 0;

    for (const producto of pedido.productos) {

      const detalle = await pool.query(
        `
        SELECT id,cantidad
        FROM pedido_detalle
        WHERE pedido_id=$1
        AND producto=$2
        LIMIT 1
        `,
        [
          pedidoId,
          producto.nombre
        ]
      );

      if (detalle.rows.length > 0) {

        await pool.query(
          `
          UPDATE pedido_detalle
          SET cantidad=$1
          WHERE id=$2
          `,
          [
            producto.cantidad_propuesta,
            detalle.rows[0].id
          ]
        );

      } else {

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

      productosProcesados++;

    }

    pedidosCreados.push({

      pedido_id: pedidoId,

      proveedor: pedido.proveedor,

      productos: productosProcesados,

      estado

    });

  }

console.log("=== RESULTADO ===");
console.log(JSON.stringify(pedidosCreados, null, 2));

  return pedidosCreados;

}

module.exports = crearPedidoAutomatico;