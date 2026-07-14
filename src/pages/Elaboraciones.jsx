import { Typography, Paper, TextField, Button, MenuItem } from "@mui/material";

function Elaboraciones() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        📖 Elaboraciones
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>

        <TextField
          fullWidth
          label="Nombre"
          margin="normal"
        />

        <TextField
          fullWidth
          label="Categoría"
          margin="normal"
        />

        <TextField
          fullWidth
          type="number"
          label="Días de conservación"
          margin="normal"
        />

        <TextField
          select
          fullWidth
          label="Tipo de conservación"
          margin="normal"
        >
          <MenuItem value="Nevera">Nevera</MenuItem>
          <MenuItem value="Congelador">Congelador</MenuItem>
          <MenuItem value="Ambiente">Ambiente</MenuItem>
        </TextField>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Guardar Elaboración
        </Button>

      </Paper>
    </>
  );
}

export default Elaboraciones;