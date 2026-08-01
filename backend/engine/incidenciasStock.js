module.exports = async function incidenciasStock(pool) {

  const result = await pool.query(`
    SELECT
      p.nombre,
      p.stock_actual,
      p.stock_minimo,

      cp.nombre AS categoria,
      u.nombre AS ubicacion,
      pr.nombre AS proveedor

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