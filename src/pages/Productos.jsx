import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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
  const [unidad, setUnidad] =useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
  const location = useLocation();
  const [editandoId, setEditandoId] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);
useEffect(() => {

  if (location.state?.proveedor) {

    setProveedor(location.state.proveedor);

  }

}, [location]);
const cargarProductos = () => {
  fetch("http://192.168.1.67:3001/productos")
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
     const url = modoEdicion
  ? `http://192.168.1.67:3001/productos/${editandoId}`
  : "http://192.168.1.67:3001/productos";

      const method = modoEdicion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          unidad,
          precio: Number(precio),
          stock: Number(stock),
          categoria,
          proveedor,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      await response.json();

      cargarProductos();

      setNombre("");
      setUnidad("");
      setPrecio("");
      setStock("");
      setCategoria("");
      setProveedor("");

      setEditandoId(null);
      setModoEdicion(false);

    } catch (err) {
      console.error(err);
      alert("Errore nel salvataggio");
    }
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `http://192.168.1.67:3001/productos/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      cargarProductos();

    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto.");
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