import { useEffect, useState } from "react";
import { API } from "../config/api";

import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";


function ProductoForm({

  nombre,
  setNombre,

  unidad,
  setUnidad,

  categoria,
  setCategoria,

  proveedor,
  setProveedor,

  stockMinimo,
  setStockMinimo,

  stockGarantizado,
  setStockGarantizado,

  ubicacion,
  setUbicacion,

  guardarProducto,

  modoEdicion,

}) {

  <TextField

  fullWidth

  label="Stock garantizado"

  type="number"

  value={stockGarantizado}

  onChange={(e)=>
    setStockGarantizado(e.target.value)
  }

  helperText="Cantidad que Sancho debe mantener siempre disponible"

/>


  const [proveedores, setProveedores] = useState([]);



  useEffect(() => {

    cargarProveedores();

  }, []);



  const cargarProveedores = async () => {

    try {

      const res = await fetch(`${API}/proveedores`);

      const data = await res.json();

      setProveedores(data);


    } catch (error) {

      console.error(
        "Error cargando proveedores:",
        error
      );

    }

  };



  return (

    <Paper
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 3
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

          onChange={(e)=>
            setNombre(e.target.value)
          }

        />



       <TextField

  select

  fullWidth

  label="Proveedor"

  value={proveedor}

  onChange={(e)=>
    setProveedor(e.target.value)
  }

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

          label="Unidad"

          value={unidad}

          onChange={(e)=>
            setUnidad(e.target.value)
          }

        >

          <MenuItem value="kg">
            kg
          </MenuItem>

          <MenuItem value="g">
            g
          </MenuItem>

          <MenuItem value="L">
            L
          </MenuItem>

          <MenuItem value="ml">
            ml
          </MenuItem>

          <MenuItem value="ud">
            unidad
          </MenuItem>

          <MenuItem value="caja">
            caja
          </MenuItem>


        </TextField>





        <TextField

          fullWidth

          label="Categoría"

          value={categoria}

          onChange={(e)=>
            setCategoria(e.target.value)
          }

        />





        <TextField

          fullWidth

          label="Stock mínimo"

          type="number"

          value={stockMinimo}

          onChange={(e)=>
            setStockMinimo(
              e.target.value
            )
          }

          helperText="Cantidad mínima antes de pedir"

        />

<TextField

  fullWidth

  label="Stock garantizado"

  type="number"

  value={stockGarantizado}

  onChange={(e)=>
    setStockGarantizado(e.target.value)
  }

  helperText="Cantidad que Sancho debe mantener siempre disponible"

/>



        <TextField

          fullWidth

          label="Ubicación"

          value={ubicacion}

          onChange={(e)=>
            setUbicacion(
              e.target.value
            )
          }

          placeholder="Ej: Cámara carne, congelador 1"

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

}


export default ProductoForm;


