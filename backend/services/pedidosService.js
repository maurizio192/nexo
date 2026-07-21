module.exports = {

  async generarPedido(pool, proveedor) {

    const existente = await pool.query(
      `
      SELECT id
      FROM pedidos
      WHERE proveedor = $1
      AND estado = 'Pendiente'
      LIMIT 1
      `,
      [proveedor]
    );

    let pedidoId;

    if (existente.rows.length > 0) {

      pedidoId = existente.rows[0].id;

    } else {

      const nuevoPedido = await pool.query(
        `
        INSERT INTO pedidos
        (fecha, proveedor)
        VALUES (CURRENT_DATE, $1)
        RETURNING id
        `,
        [proveedor]
      );

      pedidoId = nuevoPedido.rows[0].id;

    }

    const productos = await pool.query(
      `
      SELECT
        nombre,
        stock_actual,
        stock_minimo
      FROM productos
      WHERE proveedor = $1
      AND stock_actual <= stock_minimo
      `,
      [proveedor]
    );

    for (const p of productos.rows) {

      const existe = await pool.query(
        `
        SELECT id
        FROM pedido_detalle
        WHERE pedido_id = $1
        AND producto = $2
        `,
        [pedidoId, p.nombre]
      );

      if (existe.rows.length === 0) {

        const cantidad =
          Number(p.stock_minimo) -
          Number(p.stock_actual) +
          1;

        await pool.query(
          `
          INSERT INTO pedido_detalle
          (pedido_id, producto, cantidad)
          VALUES ($1, $2, $3)
          `,
          [
            pedidoId,
            p.nombre,
            cantidad,
          ]
        );

      }

    }

    return pedidoId;

  },

  async recibirPedido(pool, pedidoId) {

    const detalle = await pool.query(
      `
      SELECT producto, cantidad
      FROM pedido_detalle
      WHERE pedido_id = $1
      `,
      [pedidoId]
    );

    for (const linea of detalle.rows) {

      await pool.query(
        `
        UPDATE productos
        SET stock_actual = stock_actual + $1
        WHERE nombre = $2
        `,
        [
          linea.cantidad,
          linea.producto,
        ]
      );

    }

    await pool.query(
      `
      UPDATE pedidos
      SET estado = 'Recibido'
      WHERE id = $1
      `,
      [pedidoId]
    );

    return true;

  }

};