module.exports = async function cambiarEstado(pool, estado) {

  await pool.query(

    `
    UPDATE estado_restaurante

    SET

      estado = $1,

      actualizado = NOW()

    WHERE id = 1
    `,

    [estado]

  );

};