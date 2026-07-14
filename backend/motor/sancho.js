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
    });
// SUGERENCIAS DE COMPRA
stock.rows.forEach(p => {

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

    // PRODUCCIÓN PROGRAMADA
    const prod = await pool.query(
        `SELECT nombre, producir
         FROM elaboraciones
         WHERE dia_produccion = $1`,
        [hoy]
    );

    prod.rows.forEach(e => {
        avisos.push({
            tipo: "produccion",
            mensaje: `${e.nombre} → producir ${e.producir}`
        });
    });
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
    return {

    avisos,

    resumen: {

        stockCritico: avisos.filter(a => a.tipo === "stock").length,

        compras: avisos.filter(a => a.tipo === "compra").length,

        producciones: avisos.filter(a => a.tipo === "produccion").length

    }

};
}

module.exports = {
    generarAvisos
};