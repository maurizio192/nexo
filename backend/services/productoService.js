/*
|--------------------------------------------------------------------------
| NEXO - SERVICIO DE PRODUCTOS
|--------------------------------------------------------------------------
| Busqueda de productos reutilizable.
|
| Reutiliza el mismo criterio que Sancho ya aplicaba en sanchoChat.js:
|   - minusculas y sin acentos
|   - se ignoran las palabras vacias (de, del, la, el, los, las, un, una)
|   - se ignoran los parentesis del nombre  (ej. "TOMATE (10 KG)")
|   - LIKE '%palabra%' exigiendo todas las palabras
|   - el match exacto del nombre tiene prioridad
*/

const PALABRAS_VACIAS = [
  "de", "del", "la", "el", "los", "las", "un", "una"
];

function normalizarTextoProducto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extraerPalabras(texto) {
  return normalizarTextoProducto(texto)
    .split(/\s+/)
    .filter((palabra) => palabra && !PALABRAS_VACIAS.includes(palabra));
}

module.exports = {
  normalizarTextoProducto,
  extraerPalabras,

  /*
  | Busca productos por nombre aproximado.
  | Devuelve hasta `limite` productos (por defecto 5).
  */
  async buscarProductos(pool, texto, limite = 5) {
    const palabras = extraerPalabras(texto);

    if (palabras.length === 0) {
      return [];
    }

    const condiciones = palabras
      .map(
        (_, i) => `
          LOWER(
            REGEXP_REPLACE(p.nombre, '\\s*\\([^)]*\\)', '', 'g')
          ) LIKE '%' || $${i + 2} || '%'
        `
      )
      .join(" AND ");

    const limiteSeguro = Number.isInteger(Number(limite)) && Number(limite) > 0
      ? Number(limite)
      : 5;

    const result = await pool.query(
      `
      SELECT
        p.*,
        pr.nombre AS proveedor_nombre,
        u.nombre AS ubicacion_nombre
      FROM productos p
      LEFT JOIN proveedores pr
        ON pr.id = p.proveedor_id
      LEFT JOIN ubicaciones u
        ON u.id = p.ubicacion_id
      WHERE ${condiciones}
      ORDER BY
        CASE
          WHEN LOWER(
            REGEXP_REPLACE(p.nombre, '\\s*\\([^)]*\\)', '', 'g')
          ) = LOWER($1)
          THEN 0
          ELSE 1
        END,
        p.nombre
      LIMIT ${limiteSeguro}
      `,
      [normalizarTextoProducto(texto), ...palabras]
    );

    return result.rows;
  },

  /*
  | Obtiene un producto por id.
  */
  async obtenerProducto(pool, id) {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      return null;
    }

    const result = await pool.query(
      `
      SELECT *
      FROM productos
      WHERE id = $1
      `,
      [idNumerico]
    );

    return result.rows[0] || null;
  }
};