function crearErrorProduccion(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.public = true;
  return error;
}

function normalizarUnidad(unidad) {
  if (typeof unidad !== "string") {
    return null;
  }

  const unidadNormalizada = unidad.trim().toLowerCase();
  return unidadNormalizada || null;
}

function convertirCantidad(cantidad, unidadOrigen, unidadDestino) {
  const origen = normalizarUnidad(unidadOrigen);
  const destino = normalizarUnidad(unidadDestino);
  const valor = Number(cantidad);

  if (!Number.isFinite(valor) || valor < 0 || !origen || !destino) {
    return null;
  }

  if (origen === destino) {
    return valor;
  }

  const conversiones = {
    "g:kg": valor / 1000,
    "kg:g": valor * 1000,
    "ml:l": valor / 1000,
    "l:ml": valor * 1000,
    "ud:ud": valor
  };

  return conversiones[`${origen}:${destino}`] ?? null;
}

function calcularConsumoStock(
  cantidadReceta,
  unidadReceta,
  unidadStock,
  cantidadFormato,
  unidadFormato,
  cantidadUnidad,
  unidadProducto
) {
  const cantidadFormatoNumerica = Number(cantidadFormato || 0);
  const cantidadUnidadNumerica = Number(cantidadUnidad || 0);

  /*
   * Calcula cuánto stock consumir según cómo está almacenado
   * el producto.
   *
   * HUEVO LÍQUIDOS:
   * stock = caja
   * formato = 6 UDS
   * cada unidad = 1 L
   * => 1 caja = 6 L
   *
   * SAL LEDA:
   * stock = Uds
   * formato = 8 UDS por caja
   * cada unidad = 1 kg
   * => 1 Ud de stock = 1 kg
   *
   * ACEITE:
   * stock = L
   * formato = L
   * cada unidad = 1 L
   * => 1 L de stock = 1 L
   */
  if (
    cantidadUnidadNumerica > 0 &&
    unidadProducto
  ) {
    const consumoEnUnidadProducto = convertirCantidad(
      cantidadReceta,
      unidadReceta,
      unidadProducto
    );

    if (consumoEnUnidadProducto === null) {
      return null;
    }

    const stockEsUnidadDeFormato =
      unidadStock &&
      unidadFormato &&
      unidadStock === unidadFormato;

    const contenidoPorStock = stockEsUnidadDeFormato
      ? cantidadUnidadNumerica
      : cantidadFormatoNumerica * cantidadUnidadNumerica;

    if (contenidoPorStock <= 0) {
      return null;
    }

    return consumoEnUnidadProducto / contenidoPorStock;
  }

  return convertirCantidad(
    cantidadReceta,
    unidadReceta,
    unidadStock
  );
}

module.exports = {
  async producirElaboracion(pool, elaboracionId, cantidad, responsable) {
    const elaboracionIdNumerico = Number(elaboracionId);
    const cantidadNumerica = Number(cantidad);

    if (!Number.isInteger(elaboracionIdNumerico) || elaboracionIdNumerico <= 0) {
      throw crearErrorProduccion(400, "La elaboración indicada no es válida");
    }

    if (!Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
      throw crearErrorProduccion(400, "La cantidad a producir debe ser mayor que cero");
    }

    const client = await pool.connect();
    let transaccionIniciada = false;

    try {
      await client.query("BEGIN");
      transaccionIniciada = true;

      const elaboracionResult = await client.query(
        `
        SELECT
          e.id,
          e.nombre AS elaboracion_nombre,
          e.receta_id,
          r.nombre AS receta_nombre,
          r.unidad_produccion
        FROM elaboraciones e
        JOIN recetas r ON r.id = e.receta_id
        WHERE e.id = $1
        FOR UPDATE OF e
        `,
        [elaboracionIdNumerico]
      );

      if (elaboracionResult.rows.length === 0) {
        throw crearErrorProduccion(404, "No se encontró una elaboración con una receta vinculada");
      }

      const elaboracion = elaboracionResult.rows[0];

      // ======================================
      // VERIFICAR INGREDIENTES CON producto_id NULL
      // ======================================
      const ingredientesNullResult = await client.query(
        `
        SELECT ingrediente
        FROM receta_ingredientes
        WHERE receta_id = $1
          AND COALESCE(descontar, TRUE) = TRUE
          AND producto_id IS NULL
        `,
        [elaboracion.receta_id]
      );

      if (ingredientesNullResult.rows.length > 0) {
        const nombres = ingredientesNullResult.rows.map(r => r.ingrediente).join(", ");
        throw crearErrorProduccion(
          400,
          `No se puede producir: los siguientes ingredientes deben descontar stock pero no tienen producto asignado: ${nombres}`
        );
      }

      const totalIngredientesResult = await client.query(
        `
        SELECT COUNT(*)::int AS total
        FROM receta_ingredientes
        WHERE receta_id = $1
          AND COALESCE(descontar, TRUE) = TRUE
        `,
        [elaboracion.receta_id]
      );
      const ingredientesResult = await client.query(
        `
        SELECT
          ri.producto_id,
          ri.ingrediente,
          ri.cantidad,
          ri.unidad AS unidad_receta,
          p.nombre AS producto_nombre,
          p.unidad AS unidad_producto_stock,
          p.cantidad_formato,
          p.unidad_formato,
          p.cantidad_unidad,
          p.unidad_producto,
          p.stock_actual
        FROM receta_ingredientes ri
        JOIN productos p ON p.id = ri.producto_id
        WHERE ri.receta_id = $1
          AND COALESCE(ri.descontar, TRUE) = TRUE
        ORDER BY p.id
        FOR UPDATE OF p
        `,
        [elaboracion.receta_id]
      );

      if (ingredientesResult.rows.length !== totalIngredientesResult.rows[0].total) {
        throw crearErrorProduccion(
          400,
          "La receta tiene ingredientes descontables sin un producto de inventario válido"
        );
      }

      for (const ingrediente of ingredientesResult.rows) {
          const cantidadReceta = Number(ingrediente.cantidad) * cantidadNumerica;
const stockActual = Number(ingrediente.stock_actual);
const unidadReceta = normalizarUnidad(ingrediente.unidad_receta);
const unidadProductoStock = normalizarUnidad(ingrediente.unidad_producto_stock);
const unidadProducto = normalizarUnidad(
  ingrediente.unidad_producto || ingrediente.unidad_producto_stock
);

const consumoEnUnidadProducto = calcularConsumoStock(
  cantidadReceta,
  unidadReceta,
  unidadProductoStock,
  ingrediente.cantidad_formato,
  ingrediente.unidad_formato,
  ingrediente.cantidad_unidad,
  unidadProducto
);

        if (!unidadReceta || !unidadProductoStock) {
          throw crearErrorProduccion(
            400,
            `La unidad de ${ingrediente.producto_nombre} no está definida en la receta o en el producto`
          );
        }

        if (consumoEnUnidadProducto === null) {
  throw crearErrorProduccion(
    409,
    `No se puede convertir la unidad de ${ingrediente.producto_nombre}: receta ${ingrediente.unidad_receta}, producto ${ingrediente.unidad_producto}`
  );
}

if (!Number.isFinite(consumoEnUnidadProducto) || consumoEnUnidadProducto < 0) {
  throw crearErrorProduccion(
    400,
    `La cantidad del ingrediente ${ingrediente.producto_nombre} no es válida`
  );
}

ingrediente.consumoConvertido = consumoEnUnidadProducto;


        if (stockActual < consumoEnUnidadProducto) {
          throw crearErrorProduccion(409, `Stock insuficiente para ${ingrediente.producto_nombre}`);
        }
      }

      for (const ingrediente of ingredientesResult.rows) {
        const consumo = ingrediente.consumoConvertido;
        const actualizado = await client.query(
          `
          UPDATE productos
          SET stock_actual = stock_actual - $1
          WHERE id = $2
            AND stock_actual >= $1
          RETURNING id
          `,
          [consumo, ingrediente.producto_id]
        );

        if (actualizado.rows.length === 0) {
          throw crearErrorProduccion(409, `El stock cambió durante la producción de ${ingrediente.producto_nombre}`);
        }
      }

      const elaboracionActualizada = await client.query(
        `
        UPDATE elaboraciones
        SET bolsas_actuales = COALESCE(bolsas_actuales, 0) + $1
        WHERE id = $2
        RETURNING *
        `,
        [cantidadNumerica, elaboracion.id]
      );

      const produccionResult = await client.query(
        `
        INSERT INTO producciones
        (
          elaboracion_id,
          elaboracion,
          fecha,
          responsable,
          cantidad_producida,
          unidad_produccion,
          ubicacion,
          estado
        )
        VALUES ($1, $2, NOW(), $3, $4, $5, 'frigo_cocina', 'Completada')
        RETURNING *
        `,
        [
          elaboracion.id,
          elaboracion.elaboracion_nombre,
          responsable?.trim() || "Maurizio",
          cantidadNumerica,
          elaboracion.unidad_produccion || "bolsa_vacio"
        ]
      );

      await client.query(
        `
        INSERT INTO log_nexo (tipo, descripcion)
        VALUES ('PRODUCCION', $1)
        `,
        [`Producción de ${elaboracion.elaboracion_nombre} completada (${cantidadNumerica})`]
      );

      await client.query("COMMIT");
      transaccionIniciada = false;

      return {
        elaboracion: elaboracionActualizada.rows[0],
        produccion: produccionResult.rows[0],
        ingredientes: ingredientesResult.rows
      };
    } catch (error) {
      if (transaccionIniciada) {
        await client.query("ROLLBACK");
      }

      throw error;
    } finally {
      client.release();
    }
  }
};
