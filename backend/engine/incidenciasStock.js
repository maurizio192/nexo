module.exports = async function incidenciasStock(pool) {

  const result = await pool.query(`
    SELECT
      p.id,
      p.nombre,
      p.stock_actual,
      p.stock_minimo,
      p.stock_garantizado,

      p.formato_compra,
      p.cantidad_formato,

      p.proveedor_id,
      p.categoria_id,
      p.ubicacion_id,

      cp.nombre AS categoria,
      u.nombre AS ubicacion,
      pr.nombre AS proveedor,
      pr.dia_pedido

    FROM productos p

    LEFT JOIN categorias_productos cp
      ON p.categoria_id = cp.id

    LEFT JOIN ubicaciones u
      ON p.ubicacion_id = u.id

    LEFT JOIN proveedores pr
      ON p.proveedor_id = pr.id

    WHERE p.stock_actual <= p.stock_minimo

    ORDER BY p.nombre
  `);

  return result.rows;

};