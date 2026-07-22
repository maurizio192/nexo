const obtenerTurno = require("./motorTurnos");

module.exports = async function inicioJornada(pool) {

  const turno = obtenerTurno();

  // Elaboraciones por debajo del mínimo

  const elaboraciones = await pool.query(`
    SELECT
      nombre,
      bolsas_actuales,
      stock_minimo
    FROM elaboraciones
    WHERE bolsas_actuales <= stock_minimo
    ORDER BY nombre
  `);

  // Productos en stock crítico

  const productos = await pool.query(`
    SELECT
      nombre,
      stock_actual,
      stock_minimo
    FROM productos
    WHERE stock_actual <= stock_minimo
    ORDER BY nombre
  `);

  // Pedidos pendientes

  const pedidos = await pool.query(`
    SELECT
      id,
      proveedor
    FROM pedidos
    WHERE estado='Pendiente'
    ORDER BY proveedor
  `);

  return {

    turno,

    elaboraciones: elaboraciones.rows,

    productos: productos.rows,

    pedidos: pedidos.rows

  };

};