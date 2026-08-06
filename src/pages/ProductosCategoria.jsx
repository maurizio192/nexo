import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API } from "../config/api";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";

export default function ProductosCategoria() {

  
const { categoria } = useParams();

const [productos, setProductos] = useState([]);

useEffect(() => {

  cargarProductos();

}, [categoria]);

async function cargarProductos() {

  const respuesta = await fetch(
    `${API}/productos?categoria=${categoria}`
  );

  const datos = await respuesta.json();

  setProductos(datos);

}
  return (
    <Box sx={{ p: 3 }}>

      <Typography
  variant="h4"
  sx={{ mb: 3, fontWeight: "bold" }}
>
  {categoria}
</Typography>


      <TableContainer component={Paper}>

        <Table>

          <TableHead>

  <TableRow>

    <TableCell>Producto</TableCell>

    <TableCell>Stock actual</TableCell>

    <TableCell>Stock mínimo</TableCell>

    <TableCell>Ubicación</TableCell>

    <TableCell>Proveedor</TableCell>

    <TableCell>Acción</TableCell>

  </TableRow>

</TableHead>


          <TableBody>

            {productos.map((producto) => (

              <TableRow key={producto.nombre}>

                <TableCell>
                  {producto.nombre}
                </TableCell>

                <TableCell>
                 {producto.stock_actual}
                </TableCell>

                <TableCell>
                  {producto.stock_minimo}
                </TableCell>

                <TableCell>
                  {producto.ubicacion_nombre}
                </TableCell>

                <TableCell>
                  {producto.proveedor_nombre}
                </TableCell>

                <TableCell>

                 <Button
  variant="outlined"
  size="small"
  onClick={() => {
    window.location.href = `/producto/modificar/${producto.nombre}`;
  }}
>
  Modificar
</Button>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>


        </Table>

      </TableContainer>

    </Box>
  );
}