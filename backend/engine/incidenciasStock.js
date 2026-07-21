module.exports = async function incidenciasStock(pool) {

  const result = await pool.query(`
    SELECT
      nombre,
      stock_actual,
      stock_minimo
    FROM productos
    WHERE stock_actual <= stock_minimo
    ORDER BY nombre
  `);

  return result.rows;

};