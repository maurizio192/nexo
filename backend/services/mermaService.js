/*
|--------------------------------------------------------------------------
| NEXO - SERVICIO MERME (merma real)
|--------------------------------------------------------------------------
| Registra y consulta las rilevazioni reales de merma.
|
| Reglas del modulo:
|   - NUNCA se borra una rilevazione.
|   - Para corregir se ANULA (estado = 'anulada') conservando el historial.
|   - Las anuladas se excluyen de las estadisticas (vista mermas_estadisticas).
|   - Las estadisticas son acumuladas por producto_id + lavorazione y usan
|     media ponderada: SUM(merma) / SUM(lavorado) * 100.
|
| No tiene ninguna relacion con receta_ingredientes.merma (merma teorica).
*/

const {
  normalizarUnidad,
  convertirCantidad,
  redondear
} = require("../utils/unidades");

const ESTADO_REGISTRADA = "registrada";
const ESTADO_ANULADA = "anulada";

function crearErrorMerma(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function registrarLog(pool, descripcion) {
  try {
    await pool.query(
      `
      INSERT INTO log_nexo (tipo, descripcion)
      VALUES ('MERMA', $1)
      `,
      [descripcion]
    );
  } catch (error) {
    console.error("No se pudo registrar el log de merma:", error.message);
  }
}

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | REGISTRAR RILEVAZIONE
  |--------------------------------------------------------------------------
  | datos:
  |   producto_id / productoId
  |   lavorazione               (texto libre)
  |   cantidad_lavorada         (cantidad trabajada)
  |   unidad                    (unidad de la lavorazione)
  |   cantidad_merma            (merma medida)
  |   unidad_merma              (opcional; si difiere se convierte a 'unidad')
  |   fecha                     (opcional; por defecto now())
  |   responsable               (opcional)
  |   observaciones             (opcional)
  */
  async registrarMerma(pool, datos = {}) {
    const productoId = Number(datos.producto_id ?? datos.productoId);
    const lavorazione = String(datos.lavorazione ?? "").trim();
    const cantidadLavorada = Number(
      datos.cantidad_lavorada ?? datos.cantidadLavorada
    );
    const cantidadMerma = Number(
      datos.cantidad_merma ?? datos.cantidadMerma ?? 0
    );
    const unidad = normalizarUnidad(datos.unidad);
    const unidadMerma =
      normalizarUnidad(datos.unidad_merma ?? datos.unidadMerma) || unidad;
    const responsable = String(datos.responsable ?? "").trim() || "Sistema";
    const observaciones = datos.observaciones
      ? String(datos.observaciones).trim()
      : null;

    const fecha = datos.fecha ? new Date(datos.fecha) : new Date();

    if (!Number.isInteger(productoId) || productoId <= 0) {
      throw crearErrorMerma(400, "El producto indicado no es válido");
    }

    if (!lavorazione) {
      throw crearErrorMerma(400, "La lavorazione es obligatoria");
    }

    if (!Number.isFinite(cantidadLavorada) || cantidadLavorada <= 0) {
      throw crearErrorMerma(400, "La cantidad lavorada debe ser mayor que cero");
    }

    if (!unidad) {
      throw crearErrorMerma(400, "La unidad de la lavorazione es obligatoria");
    }

    if (!Number.isFinite(cantidadMerma) || cantidadMerma < 0) {
      throw crearErrorMerma(400, "La cantidad de merma no es válida");
    }

    if (Number.isNaN(fecha.getTime())) {
      throw crearErrorMerma(400, "La fecha no es válida");
    }

    // La merma puede venir en otra unidad (ej. 95 g sobre 3 kg):
    // se convierte siempre a la unidad de la lavorazione.
    const mermaConvertida = convertirCantidad(
      cantidadMerma,
      unidadMerma,
      unidad
    );

    if (mermaConvertida === null) {
      throw crearErrorMerma(
        409,
        `No se puede convertir la merma de ${unidadMerma} a ${unidad}`
      );
    }

    const mermaFinal = redondear(mermaConvertida, 3);

    if (mermaFinal > cantidadLavorada) {
      throw crearErrorMerma(
        400,
        "La merma no puede ser mayor que la cantidad lavorada"
      );
    }

    const producto = await pool.query(
      `
      SELECT id, nombre
      FROM productos
      WHERE id = $1
      `,
      [productoId]
    );

    if (producto.rows.length === 0) {
      throw crearErrorMerma(404, "Producto no encontrado");
    }

    const result = await pool.query(
      `
      INSERT INTO mermas
      (
        producto_id,
        lavorazione,
        cantidad_lavorada,
        unidad,
        cantidad_merma,
        cantidad_merma_original,
        unidad_merma_original,
        fecha,
        responsable,
        estado,
        observaciones
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        productoId,
        lavorazione,
        cantidadLavorada,
        unidad,
        mermaFinal,
        cantidadMerma,
        unidadMerma,
        fecha,
        responsable,
        ESTADO_REGISTRADA,
        observaciones
      ]
    );

    const merma = result.rows[0];

    await registrarLog(
      pool,
      `${producto.rows[0].nombre} · ${lavorazione}: lavorado ` +
        `${cantidadLavorada} ${unidad}, merma ${merma.cantidad_merma} ` +
        `${unidad}, neto ${merma.cantidad_neta} ${unidad}`
    );

    return merma;
  },

  /*
  |--------------------------------------------------------------------------
  | LISTAR HISTORIAL
  |--------------------------------------------------------------------------
  | filtros: producto_id, lavorazione, estado, desde, hasta, limite
  |--------------------------------------------------------------------------
  */
  async listarMermas(pool, filtros = {}) {
    const condiciones = [];
    const valores = [];

    const productoId = Number(filtros.producto_id ?? filtros.productoId);

    if (Number.isInteger(productoId) && productoId > 0) {
      valores.push(productoId);
      condiciones.push(`m.producto_id = $${valores.length}`);
    }

    if (filtros.lavorazione) {
      valores.push(`%${String(filtros.lavorazione).trim()}%`);
      condiciones.push(`m.lavorazione ILIKE $${valores.length}`);
    }

    if (filtros.estado) {
      valores.push(String(filtros.estado).trim());
      condiciones.push(`m.estado = $${valores.length}`);
    }

    if (filtros.desde) {
      valores.push(new Date(filtros.desde));
      condiciones.push(`m.fecha >= $${valores.length}`);
    }

    if (filtros.hasta) {
      valores.push(new Date(filtros.hasta));
      condiciones.push(`m.fecha <= $${valores.length}`);
    }

    const limite = Number.isInteger(Number(filtros.limite))
      ? Math.min(Math.max(Number(filtros.limite), 1), 500)
      : 200;

    const where = condiciones.length
      ? `WHERE ${condiciones.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
      SELECT
        m.*,
        p.nombre  AS producto_nombre,
        p.unidad  AS producto_unidad
      FROM mermas m
      JOIN productos p
        ON p.id = m.producto_id
      ${where}
      ORDER BY m.fecha DESC, m.id DESC
      LIMIT ${limite}
      `,
      valores
    );

    return result.rows;
  },

  /*
  |--------------------------------------------------------------------------
  | OBTENER UNA RILEVAZIONE
  |--------------------------------------------------------------------------
  */
  async obtenerMerma(pool, id) {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      throw crearErrorMerma(400, "La rilevazione indicada no es válida");
    }

    const result = await pool.query(
      `
      SELECT
        m.*,
        p.nombre AS producto_nombre,
        p.unidad AS producto_unidad
      FROM mermas m
      JOIN productos p
        ON p.id = m.producto_id
      WHERE m.id = $1
      `,
      [idNumerico]
    );

    if (result.rows.length === 0) {
      throw crearErrorMerma(404, "Rilevazione de merma no encontrada");
    }

    return result.rows[0];
  },

  /*
  |--------------------------------------------------------------------------
  | ANULAR RILEVAZIONE (SIN BORRAR)
  |--------------------------------------------------------------------------
  | No se hace DELETE fisico: se conserva el historial completo.
  | La rilevazione anulada deja de contar en las estadisticas.
  |--------------------------------------------------------------------------
  */
  async anularMerma(pool, id, { responsable, motivo } = {}) {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      throw crearErrorMerma(400, "La rilevazione indicada no es válida");
    }

    const anuladoPor = String(responsable ?? "").trim() || "Sistema";

    const motivoAnulacion = motivo ? String(motivo).trim() : null;

    const result = await pool.query(
      `
      UPDATE mermas
      SET
        estado = $2,
        fecha_anulacion = now(),
        anulado_por = $3,
        motivo_anulacion = $4
      WHERE id = $1
        AND estado <> $2
      RETURNING *
      `,
      [idNumerico, ESTADO_ANULADA, anuladoPor, motivoAnulacion]
    );

    if (result.rows.length === 0) {
      const existente = await pool.query(
        "SELECT id FROM mermas WHERE id = $1",
        [idNumerico]
      );

      if (existente.rows.length === 0) {
        throw crearErrorMerma(404, "Rilevazione de merma no encontrada");
      }

      throw crearErrorMerma(409, "La rilevazione ya estaba anulada");
    }

    const merma = result.rows[0];

    await registrarLog(
      pool,
      `Rilevazione merma #${merma.id} anulada por ${anuladoPor}` +
        (motivoAnulacion ? ` · motivo: ${motivoAnulacion}` : "")
    );

    return merma;
  },
/*
  |--------------------------------------------------------------------------
  | ESTADISTICAS ACUMULADAS (MEDIA PONDERADA)
  |--------------------------------------------------------------------------
  | Lee la vista mermas_estadisticas: agrupada por producto_id + lavorazione,
  | excluye anuladas y calcula SUM(merma)/SUM(lavorado)*100.
  |--------------------------------------------------------------------------
  */
  async obtenerEstadisticas(pool, filtros = {}) {
    const condiciones = [];
    const valores = [];

    const productoId = Number(filtros.producto_id ?? filtros.productoId);

    if (Number.isInteger(productoId) && productoId > 0) {
      valores.push(productoId);
      condiciones.push(`e.producto_id = $${valores.length}`);
    }

    if (filtros.lavorazione) {
      valores.push(`%${String(filtros.lavorazione).trim()}%`);
      condiciones.push(`e.lavorazione ILIKE $${valores.length}`);
    }

    const where = condiciones.length
      ? `WHERE ${condiciones.join(" AND ")}`
      : "";

    const result = await pool.query(
      `
      SELECT
        e.producto_id,
        p.nombre AS producto_nombre,
        p.unidad AS producto_unidad,
        e.lavorazione,
        e.total_lavorado,
        e.total_merma,
        e.total_neto,
        e.porcentaje_merma_medio_ponderado,
        e.porcentaje_resa_medio_ponderado,
        e.numero_rilevazioni
      FROM mermas_estadisticas e
      JOIN productos p
        ON p.id = e.producto_id
      ${where}
      ORDER BY p.nombre, e.lavorazione
      `,
      valores
    );

    return result.rows;
  },

  /*
  |--------------------------------------------------------------------------
  | LAVORAZIONES REGISTRADAS
  |--------------------------------------------------------------------------
  | Texto libre: se listan las ya usadas para autocompletar.
  |--------------------------------------------------------------------------
  */
  async obtenerLavorazioni(pool, productoId = null) {
    const idNumerico = Number(productoId);
    const valores = [];
    let where = "";

    if (Number.isInteger(idNumerico) && idNumerico > 0) {
      valores.push(idNumerico);
      where = "WHERE producto_id = $1";
    }

    const result = await pool.query(
      `
      SELECT DISTINCT lavorazione
      FROM mermas
      ${where}
      ORDER BY lavorazione
      `,
      valores
    );

    return result.rows.map((row) => row.lavorazione);
  }
};