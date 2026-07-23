module.exports = {

  async producirElaboracion(pool, elaboracionId, cantidad) {

    await pool.query("BEGIN");

    try {

      // Leer receta

      const receta = await pool.query(
        `
        SELECT
          ei.producto_id,
          p.nombre,
          ei.cantidad
        FROM elaboracion_ingredientes ei
        JOIN productos p
          ON p.id = ei.producto_id
        WHERE ei.elaboracion_id = $1
        ORDER BY p.nombre
        `,
        [elaboracionId]
      );

      // Descontar ingredientes

      for (const ingrediente of receta.rows) {

        const consumo = ingrediente.cantidad * cantidad;

        await pool.query(
          `
          UPDATE productos
          SET stock_actual = stock_actual - $1
          WHERE id = $2
          `,
          [
            consumo,
            ingrediente.producto_id
          ]
        );

      }

      // Aumentar elaboración producida

      await pool.query(
        `
        UPDATE elaboraciones
        SET bolsas_actuales = bolsas_actuales + $2
        WHERE id = $1
        `,
        [
          elaboracionId,
          cantidad
        ]
      );

      // Nombre elaboración

      const elaboracion = await pool.query(
        `
        SELECT nombre
        FROM elaboraciones
        WHERE id = $1
        `,
        [elaboracionId]
      );

      // Registrar producción

      await pool.query(
        `
        INSERT INTO producciones
        (
          elaboracion_id,
          elaboracion,
          fecha,
          responsable,
          cantidad_bolsas,
          estado
        )
        VALUES
        (
          $1,
          $2,
          NOW(),
          'Maurizio',
          $3,
          'Completada'
        )
        `,
        [
          elaboracionId,
          elaboracion.rows[0].nombre,
          cantidad
        ]
      );

      // Registrar log

      await pool.query(
        `
        INSERT INTO log_nexo
        (
          tipo,
          descripcion
        )
        VALUES
        (
          'PRODUCCION',
          $1
        )
        `,
        [
          `Producción de ${elaboracion.rows[0].nombre} completada (${cantidad})`
        ]
      );

      await pool.query("COMMIT");

      return receta.rows;
      
    } catch (err) {

      await pool.query("ROLLBACK");
      throw err;

    }

  }

};

