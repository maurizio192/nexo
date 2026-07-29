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

  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");

  const [formatoCompra, setFormatoCompra] = useState("");
  const [cantidadFormato, setCantidadFormato] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const location = useLocation();

useEffect(() => {
  cargarProductos();
}, []);

useEffect(() => {
  if (location.state?.proveedor) {
    setProveedor(location.state.proveedor);
  }
}, [location]);
const cargarProductos = () => {
  fetch(`${API}/productos`)
    .then((res) => res.json())
    .then((data) => setProductos(data))
    .catch((err) => console.error(err));
};
const guardarProducto = async () => {

  if (
    nombre.trim() === "" ||
    unidad.trim() === "" ||
    Number(precio) <= 0 ||
    Number(stock) < 0
  ) {
    alert("Completa correctamente todos los campos.");
    return;
  }

  try {

    const method = modoEdicion ? "PUT" : "POST";

    const url = modoEdicion
      ? `${API}/productos/${editandoId}`
      : `${API}/productos`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        unidad,
        formatoCompra,
        cantidadFormato: Number(cantidadFormato),
        stockMinimo: Number(stockMinimo),
        ubicacion,
        precio: Number(precio),
        stock: Number(stock),
        categoria,
        proveedor,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      alert(JSON.stringify(data));
      return;
    }

    cargarProductos();

    setNombre("");
    setUnidad("");
    setPrecio("");
    setStock("");
    setCategoria("");
    setProveedor("");
    setFormatoCompra("");
    setCantidadFormato("");
    setStockMinimo("");
    setUbicacion("");

    setEditandoId(null);
    setModoEdicion(false);

  } catch (err) {

    console.error(err);
    alert("Errore nel salvataggio");

  }

};

  return (
    <>
      <Typography variant="h4" gutterBottom>
  📦 Productos NUEVO
</Typography>

 <ProductoForm
  nombre={nombre}
  setNombre={setNombre}
  unidad={unidad}
  setUnidad={setUnidad}
  formatoCompra={formatoCompra}
  setFormatoCompra={setFormatoCompra}
  cantidadFormato={cantidadFormato}
  setCantidadFormato={setCantidadFormato}
  stockMinimo={stockMinimo}
  setStockMinimo={setStockMinimo}
  ubicacion={ubicacion}
  setUbicacion={setUbicacion}
  precio={precio}
  setPrecio={setPrecio}
  stock={stock}
  setStock={setStock}
  categoria={categoria}
  setCategoria={setCategoria}
  proveedor={proveedor}
  setProveedor={setProveedor}
  guardarProducto={guardarProducto}
  modoEdicion={modoEdicion}
/>


      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Unidad</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.unidad}</TableCell>
                <TableCell>{producto.precio}</TableCell>
                <TableCell>{producto.stock}</TableCell>

                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setEditandoId(producto.id);
                      setModoEdicion(true);

                      setNombre(producto.nombre);
                      setUnidad(producto.unidad);
                      setPrecio(producto.precio);
                      setStock(producto.stock);
                      setCategoria(producto.categoria);
                      setProveedor(producto.proveedor);
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => {
                   alert("CLICK");
                   eliminarProducto(producto.id);
                     }}
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