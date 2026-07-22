const express = require("express");
const cors = require("cors");

const pool = require("./config/database");

const proveedoresRoutes = require("./routes/proveedores");
const productosRoutes = require("./routes/productos");
const pedidosRoutes = require("./routes/pedidos");
const produccionesRoutes = require("./routes/producciones");
const elaboracionesRoutes = require("./routes/elaboraciones");
const categoriasRoutes = require("./routes/categorias");
const ventasRoutes = require("./routes/ventas");
const consumosRoutes = require("./routes/consumos");
const sanchoRoutes = require("./routes/sancho");
const cartasRoutes = require("./routes/cartas");
const restauranteRoutes = require("./routes/restaurante");
const panelOperacionesRoutes = require("./routes/panelOperaciones");

const app = express();

app.use(cors());
app.use(express.json());

app.locals.pool = pool;

/*
|--------------------------------------------------------------------------
| RUTAS
|--------------------------------------------------------------------------
*/

app.use("/proveedores", proveedoresRoutes(pool));
app.use("/productos", productosRoutes(pool));
app.use("/pedidos", pedidosRoutes(pool));
app.use("/producciones", produccionesRoutes(pool));
app.use("/elaboraciones", elaboracionesRoutes(pool));
app.use("/categorias", categoriasRoutes(pool));
app.use("/ventas", ventasRoutes(pool));
app.use("/consumos", consumosRoutes(pool));
app.use("/sancho", sanchoRoutes(pool));
app.use(
  "/servicio-carta",
  require("./routes/servicioCarta")(pool)
);
app.use("/cartas", cartasRoutes(pool));
app.use("/restaurante", restauranteRoutes(pool));
app.use("/panel-operaciones", panelOperacionesRoutes(pool));

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

    res.json({

        nombre: "NEXO",

        version: "Core 1.0",

        estado: "Activo"

    });

});

/*
|--------------------------------------------------------------------------
| BASE DE DATOS
|--------------------------------------------------------------------------
*/

pool.connect()

.then(() => {

    console.log("✅ Connesso a PostgreSQL");

})

.catch((err) => {

    console.error(err);

});

/*
|--------------------------------------------------------------------------
| SERVIDOR
|--------------------------------------------------------------------------
*/

const PORT = 3001;

app.listen(PORT, () => {

    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);

});