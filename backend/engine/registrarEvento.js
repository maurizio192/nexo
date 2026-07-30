module.exports = async function registrarEvento(pool, {
  usuario = "Sistema",
  accion,
  detalle = {}
}) {

  await pool.query(
    `
    INSERT INTO eventos_nexo
    (
      usuario,
      accion,
      detalle,
      fecha
    )
    VALUES
    ($1,$2,$3,NOW())
    `,
    [
      usuario,
      accion,
      JSON.stringify(detalle)
    ]
  );

};
