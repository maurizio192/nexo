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

    if (location.state?.producto) {

      editarProducto(location.state.producto);

    }

  }, [location]);



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




      <TableContainer
        component={Paper}
        sx={{ mt: 3 }}
      >


        <Table>


          <TableHead>

            <TableRow>

              <TableCell>Nombre</TableCell>

              <TableCell>Categoría</TableCell>

              <TableCell>Proveedor</TableCell>

              <TableCell>Ubicación</TableCell>

              <TableCell>Stock</TableCell>

              <TableCell>Mínimo</TableCell>

              <TableCell>Acciones</TableCell>


            </TableRow>


          </TableHead>




          <TableBody>


          {productos.map((producto)=>(


            <TableRow key={producto.id}>


              <TableCell>
                {producto.nombre}
              </TableCell>


              <TableCell>
                {producto.categoria_nombre || "-"}
              </TableCell>


              <TableCell>
                {producto.proveedor_nombre || "-"}
              </TableCell>


              <TableCell>
                {producto.ubicacion_nombre || "-"}
             </TableCell>


              <TableCell>
                {producto.stock_actual}
              </TableCell>


              <TableCell>
                {producto.stock_minimo}
              </TableCell>



              <TableCell>


                <IconButton

                  color="primary"

                  onClick={() =>
                    editarProducto(producto)
                  }

                >

                  <EditIcon />

                </IconButton>




                <IconButton

                  color="error"

                >

                  <DeleteIcon />

                </IconButton>



              </TableCell>



            </TableRow>


          ))}


          </TableBody>


        </Table>


      </TableContainer>



    </>

  );

}


export default Productos;
