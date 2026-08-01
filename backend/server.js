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
const tareasPendientesRoutes = require("./routes/tareasPendientes");
const finalizarTareaRoutes = require("./routes/finalizarTarea");
const sanchoRoutes = require("./routes/sancho");
const eventosRoutes = require("./routes/eventos");
const cartasRoutes = require("./routes/cartas");
const recetasRoutes = require("./routes/recetas");
const categoriasRecetasRoutes = require("./routes/categoriasRecetas");
const categoriasProductosRoutes = require("./routes/categoriasProductos");
const ubicacionesRoutes = require("./routes/ubicaciones");
const restauranteRoutes = require("./routes/restaurante");
const panelOperacionesRoutes = require("./routes/panelOperaciones");
const produccionHoyRoutes = require("./routes/produccionHoy");
const pedidosAutomaticosRoutes = require("./routes/pedidosAutomaticos");
const app = express();


app.use(cors());
app.use(express.json());

app.locals.pool = pool;

/*
|--------------------------------------------------------------------------
| RUTAS
|--------------------------------------------------------------------------
*/

app.use("/api/proveedores", proveedoresRoutes(pool));
app.use("/api/pedidos-automaticos", pedidosAutomaticosRoutes(pool));
app.use("/api/productos", productosRoutes(pool));
app.use("/api/ubicaciones", ubicacionesRoutes(pool));
app.use("/api/pedidos", pedidosRoutes(pool));
app.use("/api/producciones", produccionesRoutes(pool));
app.use("/api/elaboraciones", elaboracionesRoutes(pool));
app.use("/api/categorias-productos", categoriasProductosRoutes(pool));
app.use("/api/categorias", categoriasRoutes(pool));
app.use("/api/ventas", ventasRoutes(pool));
app.use("/api/consumos", consumosRoutes(pool));
app.use("/api/tareas-pendientes", tareasPendientesRoutes(pool));
app.use("/api/finalizar-tarea", finalizarTareaRoutes(pool));
app.use("/api/sancho", sanchoRoutes(pool));
app.use("/api/eventos", eventosRoutes(pool));
app.use("/api/cartas", cartasRoutes(pool));
app.use("/api/restaurante", restauranteRoutes(pool));
app.use("/api/panel-operaciones", panelOperacionesRoutes(pool));
app.use("/api/produccion-hoy", produccionHoyRoutes(pool));
app.use("/api/recetas", recetasRoutes(pool));
app.use("/api/categorias-recetas", categoriasRecetasRoutes(pool));
app.use("/api/servicio-carta", require("./routes/servicioCarta")(pool));
/*
x|--------------------------------------------------------------------------
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
