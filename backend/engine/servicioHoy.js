module.exports = async (pool) => {

  const result = await pool.query(`
    SELECT
      s.fecha,
      s.turno,
      c.nombre
    FROM servicios_carta s
    JOIN cartas c
      ON c.id = s.carta_id
    WHERE s.fecha = CURRENT_DATE
    ORDER BY s.turno
    LIMIT 1
  `);

  return result.rows[0] || null;

};