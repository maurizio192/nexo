const pool = require("../database/db");

async function clasificarProductos() {

    const { rows } = await pool.query(
        "SELECT id,nombre FROM productos"
    );

    for (const producto of rows) {

        const nombre = producto.nombre.toUpperCase();

        let categoria = "Despensa";
        let ubicacion = "Almacén";
        let unidad = "Uds";

        // ===== VERDURA =====
        if (
            /(TOMATE|LECHUGA|CEBOLLA|ZANAHORIA|PEPINO|PIMIENTO|PATATA|CALABACIN|BERENJENA|AJO|LIMON|LIMA)/.test(nombre)
        ) {
            categoria = "Verdura";
            ubicacion = "Frigo cocina";
            unidad = "Kg";
        }

        // ===== CARNE =====
        else if (
            /(VACA|TERNERA|CERDO|POLLO|LOMO|SOLOMILLO|CACHOPO|PALETILLA|COSTILLA|SECRETO|IBERICO)/.test(nombre)
        ) {
            categoria = "Carne";
            ubicacion = "Congelador Carne 1";
            unidad = "Kg";
        }

        // ===== PESCADO =====
        else if (
            /(BACALAO|MERLUZA|ATUN|PULPO|GAMBA|LANGOSTINO|CALAMAR|SEPIA|ANCHOA)/.test(nombre)
        ) {
            categoria = "Pescado";
            ubicacion = "Congelador Pescado 2";
            unidad = "Kg";
        }

        // ===== PAN =====
        else if (
            /(PAN|BRIOCHE|MOLLETE|BAGUETTE|HAMBURGUESA|TRENZA)/.test(nombre)
        ) {
            categoria = "Pan";
            ubicacion = "Congelador Pan 3";
        }

        // ===== LIMPIEZA =====
        else if (
            /(LEJIA|DETERGENTE|LIMPIADOR|DESENGRASANTE|LAVAVAJILLAS)/.test(nombre)
        ) {
            categoria = "Limpieza";
            ubicacion = "Estantería Limpieza";
        }

        // ===== ENVASES =====
        else if (
            /(ENVASE|TAPA|SERVILLETA|CAJA|VASO|BANDEJA|PAPEL)/.test(nombre)
        ) {
            categoria = "Envases";
            ubicacion = "Estantería Envases";
        }

        // ===== DELIVERY =====
        else if (
            /(DELIVERY|GLOVO|UBER)/.test(nombre)
        ) {
            categoria = "Delivery";
            ubicacion = "Estantería Delivery";
        }

        // ===== Unidad =====

        if (/KG/.test(nombre))
            unidad = "Kg";

        if (/LITRO| LT| 1L|5L|ML/.test(nombre))
            unidad = "L";

        if (/CAJA/.test(nombre))
            unidad = "Caja";

        if (/BOTELLA/.test(nombre))
            unidad = "Botella";

        await pool.query(
            `
            UPDATE productos
            SET
                categoria=$1,
                ubicacion=$2,
                unidad=$3
            WHERE id=$4
            `,
            [
                categoria,
                ubicacion,
                unidad,
                producto.id
            ]
        );

    }

    console.log("✅ Clasificación terminada");

}

module.exports = clasificarProductos;