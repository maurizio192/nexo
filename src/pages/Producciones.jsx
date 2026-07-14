import { Typography, Paper, TextField, Button } from "@mui/material";

function Producciones() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        👨‍🍳 Producciones
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <TextField
          fullWidth
          label="Elaboración"
          margin="normal"
        />

        <TextField
          fullWidth
          label="Responsable"
          margin="normal"
        />

        <TextField
          fullWidth
          type="number"
          label="Cantidad de bolsas"
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Guardar Producción
        </Button>
      </Paper>
    </>
  );
}

export default Producciones;