async function registrar(pool, tipo, descripcion) {

  await pool.query(
    `
    INSERT INTO log_nexo
    (tipo, descripcion, fecha)
    VALUES ($1,$2,NOW())
    `,
    [tipo, descripcion]
  );

}

module.exports = {
  registrar
};
