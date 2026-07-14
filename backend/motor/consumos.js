async function registrarConsumo(pool, elaboracionId, bolsas) {

    await pool.query(
        `INSERT INTO consumos
        (elaboracion_id, bolsas)
        VALUES ($1,$2)`,
        [elaboracionId, bolsas]
    );

    await pool.query(
        `UPDATE elaboraciones
         SET bolsas_actuales = bolsas_actuales - $1
         WHERE id = $2`,
        [bolsas, elaboracionId]
    );

    console.log("✅ Consumo registrado");
}

module.exports = {
    registrarConsumo,
};