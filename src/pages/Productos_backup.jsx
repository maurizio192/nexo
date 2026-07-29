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

  const [editandoId, setEditandoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);



  useEffect(() => {
    cargarProductos();
  }, []);

useEffect(() => {

  if (location.state?.producto) {

    const producto = location.state.producto;

    editarProducto(producto);

  }

}, [location]);

  const cargarProductos = async () => {

  try {

    const res = await fetch(`${API}/productos`);
    const data = await res.json();

    setProductos(data);

  } catch(error) {

    console.error("ERRORE COMPLETO:", error);
    alert(error.message);

  }

};

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



    const method = modoEdicion ? "PUT" : "POST";


    const url = modoEdicion
      ? `${API}/productos/${editandoId}`
      : `${API}/productos`;



    try {


      const response = await fetch(url, {

        method,

        headers:{
          "Content-Type":"application/json"
        },


        body: JSON.stringify({

          nombre,
          unidad,
          categoria,
          proveedor,
          stockMinimo: Number(stockMinimo),
          ubicacion

        })

      });



      const data = await response.json();



      if(!response.ok){

        console.error(data);
        alert(data.error);
        return;

      }



      cargarProductos();
      limpiarFormulario();



    } catch(error){

      console.error(error);
      alert("Error guardando producto");

    }


  };




  const editarProducto = (producto)=>{


    setEditandoId(producto.id);
    setModoEdicion(true);

    setNombre(producto.nombre);
    setUnidad(producto.unidad);
    setCategoria(producto.categoria);
    setProveedor(producto.proveedor);
    setStockMinimo(producto.stock_minimo || "");
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

        ubicacion={ubicacion}
        setUbicacion={setUbicacion}

        guardarProducto={guardarProducto}

        modoEdicion={modoEdicion}

      />



      <TableContainer component={Paper} sx={{mt:3}}>

        <Table>


          <TableHead>

            <TableRow>

              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Proveedor</TableCell>
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
                {producto.categoria}
              </TableCell>


              <TableCell>
                {producto.proveedor}
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
                  onClick={()=>editarProducto(producto)}
                >
                  <EditIcon/>
                </IconButton>



                <IconButton
                  color="error"
                >
                  <DeleteIcon/>
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