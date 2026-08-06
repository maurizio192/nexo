import { Box, Typography, TextField, Button, Paper, Grid } from "@mui/material";

export default function ModificarProducto() {

  return (

    <Box sx={{ p: 3 }}>

      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Modificar Producto
      </Typography>


      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: 700
        }}
      >

        <Grid container spacing={2}>


          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre producto"
            />
          </Grid>


          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Categoría"
            />
          </Grid>


          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Unidad"
            />
          </Grid>


          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Proveedor principal"
            />
          </Grid>


          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Stock actual"
            />
          </Grid>


          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Stock mínimo"
            />
          </Grid>


          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Stock garantizado"
            />
          </Grid>


          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ubicación almacén"
            />
          </Grid>


        </Grid>


        <Box sx={{ mt: 3 }}>

          <Button
            variant="contained"
            sx={{ mr: 2 }}
          >
            Guardar
          </Button>


          <Button
            variant="outlined"
          >
            Cancelar
          </Button>

        </Box>


      </Paper>

    </Box>

  );
}