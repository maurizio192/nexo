module.exports = async function panelOperaciones(pool) {

  const estado = await pool.query(`
    SELECT estado
    FROM estado_restaurante
    WHERE id = 1
  `);

  const modo = estado.rows[0].estado;

  return {

    modo,

    titulo:
      modo === "PRODUCCION"
        ? "Producción"
        : "Servicio"

  };

};