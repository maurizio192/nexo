import { forwardRef, useEffect, useState } from "react";
import { API } from "../config/api";

import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";


const ProductoForm = forwardRef(({

  nombre,
  setNombre,

  unidad,
  setUnidad,

  categoria,
  setCategoria,

  ubicacion,
  setUbicacion,

  proveedor,
  setProveedor,

  stockActual,
  setStockActual,

  stockMinimo,
  setStockMinimo,

  stockGarantizado,
  setStockGarantizado,

  formatoCompra,
  setFormatoCompra,

  cantidadFormato,
  setCantidadFormato,

  guardarProducto,

  modoEdicion,

}, ref) => {

  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);



  useEffect(() => {

    cargarDatos();

  }, []);



  const cargarDatos = async () => {

    try {

      const [
        proveedoresRes,
        categoriasRes,
        ubicacionesRes
      ] = await Promise.all([

        fetch(`${API}/proveedores`),
        fetch(`${API}/categorias-productos`),
        fetch(`${API}/ubicaciones`)

      ]);


      setProveedores(await proveedoresRes.json());
      setCategorias(await categoriasRes.json());
      setUbicaciones(await ubicacionesRes.json());


    } catch(error) {

      console.error(
        "Error cargando datos:",
        error
      );

    }

  };



  return (

    <Paper
      ref={ref}
      sx={{
        p:3,
        mt:3,
        borderRadius:3
      }}
    >

      <Typography
        variant="h5"
        gutterBottom
      >

        {modoEdicion
          ? "✏️ Editar Producto"
          : "➕ Nuevo Producto"}

      </Typography>



      <Stack spacing={2}>


        <TextField
          fullWidth
          label="Nombre producto"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
        />



        <TextField
          select
          fullWidth
          label="Proveedor"
          value={proveedor}
          onChange={(e)=>setProveedor(e.target.value)}
        >

          {proveedores.map((p)=>(

            <MenuItem
              key={p.id}
              value={p.id}
            >
              {p.nombre}
            </MenuItem>

          ))}

        </TextField>



        <TextField
          select
          fullWidth
          label="Categoría"
          value={categoria}
          onChange={(e)=>setCategoria(e.target.value)}
        >

          {categorias.map((c)=>(

            <MenuItem
              key={c.id}
              value={c.id}
            >
              {c.nombre}
            </MenuItem>

          ))}

        </TextField>



        <TextField
          select
          fullWidth
          label="Ubicación"
          value={ubicacion}
          onChange={(e)=>setUbicacion(e.target.value)}
        >

          {ubicaciones.map((u)=>(

            <MenuItem
              key={u.id}
              value={u.id}
            >
              {u.nombre}
            </MenuItem>

          ))}

        </TextField>



        <TextField
          select
          fullWidth
          label="Unidad"
          value={unidad}
          onChange={(e)=>setUnidad(e.target.value)}
        >

          <MenuItem value="kg">kg</MenuItem>
          <MenuItem value="g">g</MenuItem>
          <MenuItem value="L">L</MenuItem>
          <MenuItem value="ml">ml</MenuItem>
          <MenuItem value="ud">unidad</MenuItem>
          <MenuItem value="caja">caja</MenuItem>

        </TextField>

        <TextField
          fullWidth
          label="Formato de compra"
          value={formatoCompra}
          onChange={(e)=>setFormatoCompra(e.target.value)}
          helperText="Ej.: CAJA, BOTELLA, ENVASE, PIEZA"
        />

        <TextField
          fullWidth
          label="Cantidad por formato"
          type="number"
          value={cantidadFormato}
          onChange={(e)=>setCantidadFormato(e.target.value)}
          helperText="Cantidad contenida en un formato de compra"
        />

        <TextField
          fullWidth
          label="Stock mínimo"
          type="number"
          value={stockMinimo}
          onChange={(e)=>setStockMinimo(e.target.value)}
          helperText="Cantidad mínima antes de pedir"
        />

        <TextField
  label="Stock actual"
  type="number"
  value={stockActual}
  onChange={(e) => setStockActual(e.target.value)}
  fullWidth
  margin="normal"
/>



        <TextField
          fullWidth
          label="Stock garantizado"
          type="number"
          value={stockGarantizado}
          onChange={(e)=>setStockGarantizado(e.target.value)}
          helperText="Cantidad que Sancho debe mantener siempre disponible"
        />



        <Button
          variant="contained"
          size="large"
          onClick={guardarProducto}
        >

          {modoEdicion
            ? "✏️ Guardar cambios"
            : "💾 Crear producto"}

        </Button>


      </Stack>


    </Paper>

  );

});


export default ProductoForm;


