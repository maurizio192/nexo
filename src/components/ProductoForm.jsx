import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

function ProductoForm({
  nombre,
  setNombre,
  unidad,
  setUnidad,
  precio,
  setPrecio,
  stock,
  setStock,
  categoria,
  setCategoria,
  proveedor,
  setProveedor,
  guardarProducto,
  modoEdicion,
}) {

  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    fetch("http://192.168.1.67:3001/proveedores")
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>

      <Typography variant="h5" gutterBottom>
        {modoEdicion ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
      </Typography>

      <TextField
        fullWidth
        label="Nombre"
        margin="normal"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <TextField
        select
        fullWidth
        label="Proveedor"
        margin="normal"
        value={proveedor}
        onChange={(e) => setProveedor(e.target.value)}
      >
        {proveedores.map((p) => (
          <MenuItem key={p.id} value={p.nombre}>
            {p.nombre}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="Unidad"
        margin="normal"
        value={unidad}
        onChange={(e) => setUnidad(e.target.value)}
      >
        <MenuItem value="kg">kg</MenuItem>
        <MenuItem value="g">g</MenuItem>
        <MenuItem value="L">L</MenuItem>
        <MenuItem value="ml">ml</MenuItem>
        <MenuItem value="ud">ud</MenuItem>
        <MenuItem value="caja">caja</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Precio"
        type="number"
        margin="normal"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
      />

      <TextField
        fullWidth
        label="Stock"
        type="number"
        margin="normal"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <TextField
        fullWidth
        label="Categoría"
        margin="normal"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3 }}
        onClick={guardarProducto}
      >
        {modoEdicion ? "✏️ Actualizar Producto" : "💾 Guardar Producto"}
      </Button>

    </Paper>
  );
}

export default ProductoForm;