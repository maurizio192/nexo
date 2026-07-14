async function comprobarElaboraciones(pool) {

    const total = await pool.query(
        "SELECT COUNT(*) FROM elaboraciones"
    );

    console.log("📖 Elaboraciones:", total.rows[0].count);

    const avisos = await pool.query(`
        SELECT nombre, bolsas_actuales
        FROM elaboraciones
        WHERE bolsas_actuales <= 2
    `);

    if (avisos.rows.length === 0) {
        console.log("✅ Todas las elaboraciones tienen stock suficiente");
    } else {
        avisos.rows.forEach(e => {
            console.log(`⚠️ Quedan ${e.bolsas_actuales} bolsas de ${e.nombre}`);
        });
    }
}

module.exports = {
    comprobarElaboraciones,
};