import { useEffect, useState } from "react";

import {
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
function Productos() {
  const [productos, setProductos] = useState([]);

useEffect(() => {
  fetch("http://localhost:3001/prodotti")
    .then((res) => res.json())
    .then((data) => setProductos(data))
    .catch((err) => console.error(err));
}, []);
  return (
    <>
      <Typography variant="h4" gutterBottom>
        📦 Productos
      </Typography>

      <Button variant="contained" size="large">
        ➕ Nuevo producto
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Unidad</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.unidad}</TableCell>
                <TableCell>{producto.precio}</TableCell>
                <TableCell>{producto.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Productos;