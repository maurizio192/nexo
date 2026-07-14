const stock = require("./stock");
const elaboraciones = require("./elaboraciones");
const config = require("./config");
const produccion = require("./produccion");
const consumos = require("./consumos");
async function iniciarMotor(pool) {

    console.log("");
    console.log("==================================");
    console.log("🧠 MOTOR NEXO");
    console.log("==================================");
    console.log("🏠 Restaurante:", config.restaurante);
    console.log("");

    await stock.comprobarStock(pool);

    await elaboraciones.comprobarElaboraciones(pool);
    await produccion.comprobarProduccion(pool);
    console.log("");
    console.log("✅ Motor listo");
    console.log("");
}

module.exports = {
    iniciarMotor,
};