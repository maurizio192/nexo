module.exports = {

  async recibirPedido(pool, pedidoId, recepciones = null) {

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
          d.id,
          d.producto,
          d.cantidad,
          d.cantidad_recibida,
          d.formato,
          p.id AS producto_id,
          p.cantidad_formato
        FROM pedido_detalle d
        JOIN productos p
          ON p.nombre = d.producto
        WHERE d.pedido_id = $1
        ORDER BY d.id
        `,
        [pedidoId]
      );

      // ======================================
      // ACTUALIZAR STOCK
      // ======================================

      for (const linea of detalle.rows) {

        const cantidadPedido =
          Number(linea.cantidad || 0);

        const cantidadRecibidaAnterior =
          Number(linea.cantidad_recibida || 0);

        const cantidadPendiente =
          Math.max(
            0,
            cantidadPedido - cantidadRecibidaAnterior
          );

        if (cantidadPendiente <= 0) {
          continue;
        }

        // ======================================
        // DETERMINAR CANTIDAD RECIBIDA
        // ======================================

        let cantidadRecibidaAhora =
          cantidadPendiente;

        if (Array.isArray(recepciones)) {

          const recepcion =
            recepciones.find(
              r =>
                Number(r.detalle_id) ===
                Number(linea.id)
            );

          if (!recepcion) {
            continue;
          }

          cantidadRecibidaAhora =
            Number(recepcion.cantidad || 0);

        }

        // ======================================
        // VALIDACIONES
        // ======================================

        if (
          !Number.isFinite(cantidadRecibidaAhora) ||
          cantidadRecibidaAhora <= 0
        ) {
          continue;
        }

        if (
          cantidadRecibidaAhora >
          cantidadPendiente
        ) {
          throw new Error(
            `La recepción de ${linea.producto} ` +
            `supera la cantidad pendiente. ` +
            `Pendiente: ${cantidadPendiente}`
          );
        }

        const cantidadFormato =
          linea.cantidad_formato !== null
            ? Number(linea.cantidad_formato)
            : 1;

        const formato =
          (linea.formato || "").toUpperCase();

        const unidadesRecibidas =
          formato &&
          formato !== "UDS"
            ? cantidadRecibidaAhora *
              cantidadFormato
            : cantidadRecibidaAhora;

        console.log(
          `RECIBIENDO: ${linea.producto} | ` +
          `${cantidadRecibidaAhora} ` +
          `${linea.formato || "UDS"} | ` +
          `factor: ${cantidadFormato} | ` +
          `unidades: ${unidadesRecibidas}`
        );

        // ======================================
        // SUMAR AL STOCK
        // ======================================

        await client.query(
          `
          UPDATE productos
          SET stock_actual =
            stock_actual + $1
          WHERE id = $2
          `,
          [
            unidadesRecibidas,
            linea.producto_id
          ]
        );

        // ======================================
        // REGISTRAR CANTIDAD RECIBIDA
        // ======================================

        await client.query(
          `
          UPDATE pedido_detalle
          SET cantidad_recibida =
            cantidad_recibida + $1
          WHERE id = $2
          `,
          [
            cantidadRecibidaAhora,
            linea.id
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
      // COMPROBAR SI EL PEDIDO ESTÁ COMPLETO
      // ======================================

      const pendientes = await client.query(
        `
        SELECT COUNT(*) AS pendientes
        FROM pedido_detalle
        WHERE pedido_id = $1
          AND cantidad_recibida < cantidad
        `,
        [pedidoId]
      );

      const pedidoCompleto =
        Number(
          pendientes.rows[0].pendientes
        ) === 0;

      // ======================================
      // ACTUALIZAR ESTADO
      // ======================================

      const nuevoEstado =
        pedidoCompleto
          ? "Recibido"
          : "Pendiente";

      await client.query(
        `
        UPDATE pedidos
        SET estado = $1
        WHERE id = $2
        `,
        [
          nuevoEstado,
          pedidoId
        ]
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
            productos: detalle.rows.length,
            estado: nuevoEstado,
            parcial: Array.isArray(recepciones)
          })
        ]
      );

      // ======================================
      // CONFIRMAR
      // ======================================

      await client.query("COMMIT");

      return {
        pedido: pedidoId,
        productos: detalle.rows.length,
        estado: nuevoEstado
      };

    } catch (err) {

      await client.query("ROLLBACK");

      throw err;

    } finally {

      client.release();

    }

  }

};
