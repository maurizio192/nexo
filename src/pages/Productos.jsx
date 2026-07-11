import { useEffect, useState } from "react";

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

import ProductoForm from "../components/ProductoForm";

function Productos() {
  const [productos, setProductos] = useState([]);

  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [proveedor, setProveedor] = useState("");
const [editandoId, setEditandoId] = useState(null);
const [modoEdicion, setModoEdicion] = useState(false);
  useEffect(() => {
    fetch("http://localhost:3001/prodotti")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));
  }, []);

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
      const response = await fetch("http://localhost:3001/prodotti", {
        method: "POST",
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

      const nuevoProducto = await response.json();

      setProductos((prev) => [...prev, nuevoProducto]);

      setNombre("");
      setUnidad("");
      setPrecio("");
      setStock("");
      setCategoria("");
      setProveedor("");
    } catch (err) {
      console.error(err);
    }
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
        precio={precio}
        setPrecio={setPrecio}
        stock={stock}
        setStock={setStock}
        categoria={categoria}
        setCategoria={setCategoria}
        proveedor={proveedor}
        setProveedor={setProveedor}
        guardarProducto={guardarProducto}
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
                  <IconButton color="primary">
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