async function generarAvisos(pool) {

    console.log("SANCHO INICIADO");

    if (!pool) {
        throw new Error("POOL NO EXISTE");
    }

    const avisos = [];

    console.log("CONSULTANDO PRODUCTOS...");

    // STOCK BAJO
    const stock = await pool.query(`
        SELECT nombre, stock_actual
        FROM productos
        WHERE stock_actual <= stock_minimo
    `);

    stock.rows.forEach(p => {

        avisos.push({
            tipo: "stock",
            mensaje: `${p.nombre} → quedan ${p.stock_actual}`
        });

        avisos.push({
            tipo: "compra",
            mensaje: `Comprar ${p.nombre}`
        });

    });

    // DÍA ACTUAL
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

    console.log("HOY =", hoy);

    // PRODUCCIONES DEL DÍA
    const prod = await pool.query(
        `
        SELECT nombre, producir
        FROM elaboraciones
        WHERE dia_produccion = $1
        `,
        [hoy]
    );

    prod.rows.forEach(e => {

        avisos.push({
            tipo: "produccion",
            mensaje: `${e.nombre} → producir ${e.producir} bolsas`
        });

    });

    // ==========================
    // RECOMENDACIONES INTELIGENTES
    // ==========================

    const recomendaciones = [];

    const stockCritico =
        avisos.filter(a => a.tipo === "stock").length;

    const compras =
        avisos.filter(a => a.tipo === "compra").length;

    const producciones =
        avisos.filter(a => a.tipo === "produccion").length;

    if (stockCritico >= 3) {

        recomendaciones.push(
            "⚠️ Hay varios productos con stock crítico. Conviene realizar un pedido hoy."
        );

    }

    if (compras >= 3) {

        recomendaciones.push(
            "🛒 Existen varias compras pendientes."
        );

    }

    if (producciones === 0) {

        recomendaciones.push(
            "👨‍🍳 Hoy no hay producciones programadas."
        );

    }

    return {

        saludo: `Buenos días. Hoy tienes ${stockCritico} productos con stock crítico.`,

        avisos,

        resumen: {

            stockCritico,

            compras,

            producciones

        },
         ultimaActualizacion: new Date().toLocaleString("es-ES"),
         
        recomendaciones

    };

}

module.exports = {
    generarAvisos
};