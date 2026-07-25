module.exports = {

  async crear(pool, datos) {

    const result = await pool.query(
      `
      INSERT INTO recetas
      (
        codigo,
        nombre,
        categoria,
        unidad_produccion,
        raciones_por_unidad,
        consumo_servicio,
        unidad_consumo,
        procedimiento,
        emplatado,
        alergenos,
        observaciones,
        tiempo_preparacion,
        tiempo_coccion,
        temperatura,
        activa
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,TRUE
      )
      RETURNING *
      `,
      [
        datos.codigo,
        datos.nombre,
        datos.categoria,
        datos.unidadProduccion,
        datos.racionesPorUnidad,
        datos.consumoServicio,
        datos.unidadConsumo,
        datos.procedimiento,
        datos.emplatado,
        datos.alergenos,
        datos.observaciones,
        datos.tiempoPreparacion,
        datos.tiempoCoccion,
        datos.temperatura
      ]
    );

    return result.rows[0];

  }

};