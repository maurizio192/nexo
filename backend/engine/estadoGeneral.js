module.exports = async function estadoGeneral(pool) {

  const producciones = await pool.query(`
    SELECT COUNT(*) AS total
    FROM producciones
    WHERE estado = 'Pendiente'
  `);

  const pedidos = await pool.query(`
    SELECT COUNT(*) AS total
    FROM pedidos
    WHERE estado = 'Pendiente'
  `);

  const stock = await pool.query(`
    SELECT COUNT(*) AS total
    FROM productos
    WHERE stock_actual <= stock_minimo
  `);

  const ventas = await pool.query(`
    SELECT COUNT(*) AS total
    FROM ventas_servicio
    WHERE DATE(fecha) = CURRENT_DATE
  `);

  return {
    producciones: Number(producciones.rows[0].total),
    pedidos: Number(pedidos.rows[0].total),
    stockCritico: Number(stock.rows[0].total),
    ventasHoy: Number(ventas.rows[0].total)
  };

};