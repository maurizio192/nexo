const XLSX = require("xlsx");

function normalizarProveedor(nombre) {

    const mapa = {

        "MAKRO": "Makro",

        "DISTRIBUCIONES SANDI - ALIMENTACION": "Sandi",

        "SANDI": "Sandi",

        "ISIDRO VERDULERIA": "Isidro verduleria",

        "JESUS TOJAR": "Jesús Carne",

        "JESUS CARNE": "Jesús Carne",

        "CARNICA LUJAN": "Cárnicas Luján",

        "GRUPO VIENA": "Grupo Viena"

    };

    const clave = nombre
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    return mapa[clave] || nombre;
}

async function importarProductosExcel(rutaExcel, pool) {

    const workbook = XLSX.readFile(rutaExcel);

    const hojas = ["Cocina", "Desayunos"];

    let proveedorActual = "";
    let leyendoProductos = false;
    let total = 0;

    for (const hoja of hojas) {

        if (!workbook.Sheets[hoja]) continue;

        const filas = XLSX.utils.sheet_to_json(
            workbook.Sheets[hoja],
            {
                header: 1,
                defval: ""
            }
        );

        for (const fila of filas) {

            // Línea vacía
            if (fila.length === 0) continue;

        // Detectar proveedor
if (fila.length === 1 && fila[0]) {

    const texto = String(fila[0]).trim();

    if (
        texto !== "PEDIDOS COCINA - CAFETERIA SANCHO" &&
        !texto.toUpperCase().includes("TELEF") &&
        !texto.toUpperCase().includes("WHATSAPP") &&
        !texto.toUpperCase().includes("PEDIDOS AL") &&
        !texto.toUpperCase().includes("24H") &&
        !texto.toUpperCase().includes("48H") &&
        !texto.match(/^\d{3}/) &&
        texto !== ""
    ) {
        proveedorActual = texto;
        leyendoProductos = false;
    }

    continue;
}

            // Cabecera
            if (fila[0] === "PRODUCTO") {
                leyendoProductos = true;
                continue;
            }

            if (!leyendoProductos) continue;

            const nombre = String(fila[0] || "").trim();
            const codigo = String(fila[1] || "").trim();
            const formato = String(fila[2] || "").trim();

            if (!nombre) continue;

            if (
    /^\d/.test(nombre) ||
    nombre.toUpperCase().includes("OPERADOR") ||
    nombre.toUpperCase().includes("COSME") ||
    nombre.toUpperCase().includes("PEDIDOS AL") ||
    nombre.toUpperCase().includes("24H ANTELACION") ||
    nombre.toUpperCase().includes("48H ANTELACION")
) {
    continue;
}

            const texto = nombre.toUpperCase();

if (
    texto.includes("PEDIDOS") ||
    texto.includes("TELEF") ||
    texto.includes("WHATSAPP") ||
    texto.includes("INVENTARIO") ||
    texto.includes("COMERCIAL") ||
    texto === "LIMPIEZA" ||
    texto === "MAKRO" ||
    texto === "FRUTERIA" ||
    texto.startsWith("DISTRIBUCIONES") ||
    texto.startsWith("QUESOS") ||
    texto.startsWith("BERLYS") ||
    texto.startsWith("DIST.")
) {
    proveedorActual = nombre;
    leyendoProductos = false;
    continue;
}

if (nombre.length > 100) {
    console.log("NOME TROPPO LUNGO:", nombre.length, nombre);
}

try {

    // Buscar proveedor_id
    const proveedorResult = await pool.query(
        "SELECT id FROM proveedores WHERE nombre = $1 LIMIT 1",
        [proveedorActual]
    );

   const proveedor_id =
    proveedorResult.rows.length > 0
        ? proveedorResult.rows[0].id
        : null;

// DEBUG
console.log("--------------------------------");
console.log("PRODUCTO :", nombre);
console.log("PROVEEDOR ACTUAL :", proveedorActual);
console.log("PROVEEDOR NORMALIZADO :", normalizarProveedor(proveedorActual));
console.log("PROVEEDOR_ID :", proveedor_id);
console.log("--------------------------------");

await pool.query(
`
INSERT INTO productos
(
    nombre,
    unidad,
    codigo,
    formato_compra,
    proveedor,
    proveedor_id,
    stock_actual,
    stock_minimo,
    stock_garantizado
)
VALUES
($1,$2,$3,$4,$5,$6,0,3,0)

ON CONFLICT (nombre)

DO UPDATE SET

codigo = EXCLUDED.codigo,
formato_compra = EXCLUDED.formato_compra,
proveedor = EXCLUDED.proveedor,
proveedor_id = EXCLUDED.proveedor_id;
`,
[
    nombre,
    "Uds",
    codigo,
    formato,
    proveedorActual,
    proveedor_id
]
);



} catch (err) {


    console.log("====================================");
    console.log("PRODUCTO:");
    console.log(nombre);

    console.log("CODIGO:");
    console.log(codigo);

    console.log("FORMATO:");
    console.log(formato);

    console.log("PROVEEDOR:");
    console.log(proveedorActual);

    throw err;
}

total++;
        }
    }

    console.log("Productos encontrados:", total);
}

module.exports = importarProductosExcel;