async function guardar(pool, tipo, texto) {

  await pool.query(
    `
    INSERT INTO log_nexo
    (tipo, descripcion, fecha)
    VALUES ($1,$2,NOW())
    `,
    [tipo, texto]
  );

}

async function ultimos(pool, limite = 20) {

  const r = await pool.query(
    `
    SELECT *
    FROM log_nexo
    ORDER BY fecha DESC
    LIMIT $1
    `,
    [limite]
  );

  return r.rows;

}

module.exports = {
  guardar,
  ultimos
};
