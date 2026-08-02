import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { API } from "../config/api";

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import ProductoForm from "../components/ProductoForm";


function Productos() {


  const [productos, setProductos] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const location = useLocation();


  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [stockGarantizado, setStockGarantizado] = useState(0);
 
  const [editandoId, setEditandoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);



useEffect(() => {

  cargarProductos();

}, []);



useEffect(() => {

  cargarCategorias();

}, []);


  useEffect(() => {

    if (location.state?.producto) {

      editarProducto(location.state.producto);

    }

  }, [location]);

  // ==========================
// FILTRAR PRODUCTOS POR CATEGORÍA
// ==========================

const productosFiltrados = productos.filter(
  (p) =>
    Number(p.categoria_id) === Number(categoriaSeleccionada)
);

// ==========================
// ESTADO STOCK
// ==========================

const estadoStock = (producto) => {

  if (
    Number(producto.stock_actual) <= 0
  ) {
    return "🔴";
  }


  if (
    Number(producto.stock_actual) <
    Number(producto.stock_minimo)
  ) {
    return "🟡";
  }


  return "🟢";

};


  // ==========================
  // CARGAR PRODUCTOS
  // ==========================

  const cargarProductos = async () => {

    try {

      const res = await fetch(`${API}/productos`);

      const data = await res.json();

      setProductos(data);


    } catch(error) {

      console.error("Error cargando productos:", error);

    }

  };


const cargarCategorias = async () => {

  try {

    const res = await fetch(
      `${API}/categorias-productos`
    );

    const data = await res.json();

    setCategorias(data);

  } catch(error) {

    console.error(
      "Error cargando categorias:",
      error
    );

  }

}

  // ==========================
  // LIMPIAR FORMULARIO
  // ==========================

  const limpiarFormulario = () => {

    setNombre("");
    setUnidad("");
    setCategoria("");
    setProveedor("");
    setStockMinimo("");
    setUbicacion("");

    setEditandoId(null);
    setModoEdicion(false);

  };



  // ==========================
  // GUARDAR / MODIFICAR
  // ==========================

  const guardarProducto = async () => {


    if (
      !nombre ||
      !unidad ||
      !categoria ||
      !proveedor
    ) {

      alert("Completa los campos obligatorios");

      return;

    }



   const datos = {

  nombre,
  unidad,

  categoria_id: Number(categoria),

  proveedor_id: Number(proveedor),

  ubicacion_id: Number(ubicacion),

  stockGarantizado: Number(stockGarantizado) || 0,

  stockMinimo: Number(stockMinimo) || 0

};


    console.log("DATOS ENVIADOS:", datos);



    const method = modoEdicion ? "PUT" : "POST";


    const url = modoEdicion

      ? `${API}/productos/${editandoId}`

      : `${API}/productos`;



    try {


      const response = await fetch(url, {

        method,

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify(datos)

      });



      const data = await response.json();



      if (!response.ok) {

        console.error(data);

        alert(data.error || "Error guardando producto");

        return;

      }



      cargarProductos();

      limpiarFormulario();



    } catch(error) {

      console.error("Error completo:", error);

      alert(error.message);

    }

  };



  // ==========================
  // EDITAR PRODUCTO
  // ==========================

  const editarProducto = (producto) => {


    setEditandoId(producto.id);

    setModoEdicion(true);


    setNombre(producto.nombre || "");

    setUnidad(producto.unidad || "");

    setCategoria(producto.categoria || "");

    setProveedor(producto.proveedor || "");


    setStockMinimo(
      String(producto.stock_minimo ?? "")
    );


    setUbicacion(producto.ubicacion || "");


  };



  return (

    <>

{categoriaSeleccionada && (

  <Paper
    sx={{
      mt: 4,
      p: 3
    }}
  >

    <Typography variant="h5">
      Productos
    </Typography>


    {productosFiltrados.map((producto) => (

     <Paper
  key={producto.id}
  sx={{
    mt: 2,
    p: 2,
    borderRadius: 3,
    borderLeft:
      estadoStock(producto) === "🔴"
        ? "8px solid #d32f2f"
        : estadoStock(producto) === "🟡"
        ? "8px solid #f9a825"
        : "8px solid #2e7d32"
  }}
>

        <Typography variant="h6">
  📦 {producto.nombre}
</Typography>


<Typography sx={{ mt: 1 }}>
  🚚 Proveedor: {producto.proveedor_nombre || "-"}
</Typography>


<Typography>
  📍 Ubicación: {producto.ubicacion_nombre || "-"}
</Typography>


<Typography sx={{ mt: 1 }}>
  Estado: {estadoStock(producto)}
</Typography>


<Typography>
  Stock: {producto.stock_actual} / {producto.stock_minimo}
</Typography>


      </Paper>

    ))}


  </Paper>

)}


      <Typography variant="h4" gutterBottom>

        📦 Productos

      </Typography>



      <ProductoForm

        nombre={nombre}
        setNombre={setNombre}

        unidad={unidad}
        setUnidad={setUnidad}

        categoria={categoria}
        setCategoria={setCategoria}

        proveedor={proveedor}
        setProveedor={setProveedor}

        stockMinimo={stockMinimo}
        setStockMinimo={setStockMinimo}

        stockGarantizado={stockGarantizado}
        setStockGarantizado={setStockGarantizado}

        ubicacion={ubicacion}
        setUbicacion={setUbicacion}

        guardarProducto={guardarProducto}

        modoEdicion={modoEdicion}

      />

      <Typography
        variant="h5"
        sx={{ mt: 4, mb: 2 }}
      >
        Categorías
      </Typography>


      <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px"
  }}
>

        {categorias.map((cat) => (

         <Paper
  key={cat.id}
  onClick={() =>
    setCategoriaSeleccionada(cat.id)
  }
  sx={{
    p: 1,
    minHeight: 80,
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 2
  }}
>
      <Typography
  sx={{
    fontSize: "22px",
    lineHeight: 1
  }}
>

  {
    {
      Verdura: "🥬",
      Carne: "🥩",
      Pescado: "🐟",
      Lácteos: "🧀",
      Despensa: "🧂",
      Congelados: "🧊",
      Limpieza: "🧼",
      Delivery: "🚚"
    }[cat.nombre] || "📦"
  }

</Typography>


            <Typography>

              {cat.nombre}

            </Typography>


          </Paper>

        ))}

       </div>

    </>

  );

}


export default Productos;
