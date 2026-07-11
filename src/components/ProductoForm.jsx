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
}) {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        ➕ Nuevo Producto
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
        label="Unidad"
        margin="normal"
        value={unidad}
        onChange={(e) => setUnidad(e.target.value)}
      >
        <MenuItem value="kg">kg</MenuItem>
        <MenuItem value="g">g</MenuItem>
        <MenuItem value="l">l</MenuItem>
        <MenuItem value="ml">ml</MenuItem>
        <MenuItem value="unidad">Unidad</MenuItem>
        <MenuItem value="caja">Caja</MenuItem>
        <MenuItem value="botella">Botella</MenuItem>
        <MenuItem value="lata">Lata</MenuItem>
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

      <TextField
        fullWidth
        label="Proveedor"
        margin="normal"
        value={proveedor}
        onChange={(e) => setProveedor(e.target.value)}
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={guardarProducto}
      >
        💾 Guardar Producto
      </Button>
    </Paper>
  );
}

export default ProductoForm;