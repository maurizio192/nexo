const pool = require("./database/db");

const importar = require("./import/importarProductosExcel");

importar(
"/home/maurizio/Scrivania/nexo/SO PEDIDOSCOCINA_.xlsx",
pool
);