async function comprobarProduccion(pool) {

    const dias = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    const hoy = dias[new Date().getDay()];

    console.log("📅 Hoy:", hoy);

    const result = await pool.query(
        `SELECT nombre, bolsas_actuales, stock_minimo, producir
         FROM elaboraciones
         WHERE dia_produccion = $1`,
        [hoy]
    );

    if (result.rows.length === 0) {
        console.log("✅ No hay producciones programadas");
        return;
    }

    console.log("👨‍🍳 PRODUCCIONES DE HOY");

    result.rows.forEach(e => {

        if (e.bolsas_actuales <= e.stock_minimo) {
            console.log(`➡️ ${e.nombre} → producir ${e.producir} bolsas`);
        } else {
            console.log(`✅ ${e.nombre} tiene stock suficiente`);
        }

    });
}

module.exports = {
    comprobarProduccion,
};