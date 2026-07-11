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
  const productos = [
    { id: 1, nombre: "Harina 00", unidad: "kg", precio: "0,95 €", stock: 25 },
    { id: 2, nombre: "Mozzarella", unidad: "kg", precio: "7,80 €", stock: 12 },
    { id: 3, nombre: "Parmigiano", unidad: "kg", precio: "14,50 €", stock: 6 },
  ];

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