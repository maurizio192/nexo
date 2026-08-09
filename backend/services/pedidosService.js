module.exports = {

  async recibirPedido(pool, pedidoId) {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    // ======================================
    // COMPROBAR ESTADO DEL PEDIDO
    // ======================================

    const pedido = await client.query(
      `
      SELECT id, estado
      FROM pedidos
      WHERE id = $1
      FOR UPDATE
      `,
      [pedidoId]
    );

    if (pedido.rows.length === 0) {
      throw new Error(
        "Pedido no encontrado: " + pedidoId
      );
    }

    if (pedido.rows[0].estado === "Recibido") {
      throw new Error(
        "El pedido " + pedidoId + " ya está recibido"
      );
    }

    // ======================================
    // OBTENER DETALLE
    // ======================================

    const detalle = await client.query(
      `
      SELECT
        d.producto,
        d.cantidad,
        d.formato,
        p.id AS producto_id,
        p.cantidad_formato
      FROM pedido_detalle d
      JOIN productos p
        ON p.nombre = d.producto
      WHERE d.pedido_id = $1
      `,
      [pedidoId]
    );

    // ======================================
    // ACTUALIZAR STOCK
    // ======================================

    for (const linea of detalle.rows) {

      const cantidadPedido =
        Number(linea.cantidad);

      const cantidadFormato =
        linea.cantidad_formato !== null
          ? Number(linea.cantidad_formato)
          : 1;

      const formato =
        (linea.formato || "").toUpperCase();

      const unidadesRecibidas =
        formato &&
        formato !== "UDS"
          ? cantidadPedido * cantidadFormato
          : cantidadPedido;

      console.log(
        `RECIBIENDO: ${linea.producto} | ` +
        `${cantidadPedido} ${linea.formato || "UDS"} | ` +
        `factor: ${cantidadFormato} | ` +
        `unidades: ${unidadesRecibidas}`
      );

      await client.query(
        `
        UPDATE productos
        SET stock_actual = stock_actual + $1
        WHERE id = $2
        `,
        [
          unidadesRecibidas,
          linea.producto_id
        ]
      );

      // ======================================
      // LIMPIAR PRÓXIMO PEDIDO PROGRAMADO
      // ======================================

      await client.query(
        `
        UPDATE productos
        SET
          pedido_proximo_cantidad = NULL,
          pedido_proximo_formato = NULL
        WHERE id = $1
        `,
        [linea.producto_id]
      );

    }

    // ======================================
    // MARCAR PEDIDO COMO RECIBIDO
    // ======================================

    await client.query(
      `
      UPDATE pedidos
      SET estado = 'Recibido'
      WHERE id = $1
      `,
      [pedidoId]
    );

    // ======================================
    // REGISTRAR EVENTO
    // ======================================

    await client.query(
      `
      INSERT INTO eventos_nexo
      (
        fecha,
        usuario,
        accion,
        detalle
      )
      VALUES
      (
        NOW(),
        'Sancho',
        'RECIBIR_PEDIDO',
        $1
      )
      `,
      [
        JSON.stringify({
          pedido: pedidoId,
          productos: detalle.rows.length
        })
      ]
    );

    // ======================================
    // CONFIRMAR TRANSACCIÓN
    // ======================================

    await client.query("COMMIT");

    return {
      pedido: pedidoId,
      productos: detalle.rows.length,
      estado: "RECIBIDO"
    };

  } catch (err) {

    await client.query("ROLLBACK");

    throw err;


      } finally {

    client.release();

  }

  }
};