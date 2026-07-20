module.exports = {

  async generarPedido(pool, proveedor) {

    // Buscar si ya existe un pedido pendiente

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

    // Obtener productos pendientes

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

    // Añadir solo los productos que aún no estén en el pedido

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

        const cantidad = Number(p.stock_minimo) - Number(p.stock_actual) + 1;

        await pool.query(
          `
          INSERT INTO pedido_detalle
          (pedido_id, producto, cantidad)
          VALUES ($1, $2, $3)
          `,
          [pedidoId, p.nombre, cantidad]
        );

      }

    }

    return pedidoId;

  }

};