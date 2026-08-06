import { Box, Typography, Grid, Paper, Button } from "@mui/material";

export default function ProductosNuevo() {

  const categorias = [
    { nombre: "Carne", icono: "🥩" },
    { nombre: "Pescado", icono: "🐟" },
    { nombre: "Marisco", icono: "🦐" },
    { nombre: "Verdura", icono: "🥬" },
    { nombre: "Fruta", icono: "🍎" },
    { nombre: "Lácteos", icono: "🧀" },
    { nombre: "Congelados", icono: "❄️" },
    { nombre: "Conservas", icono: "🥫" },
    { nombre: "Especias", icono: "🧂" },
    { nombre: "Panadería", icono: "🍞" },
    { nombre: "Limpieza", icono: "🧽" },
    { nombre: "Envases", icono: "📦" }
  ];

  return (
    <Box sx={{ p: 3 }}>

      <Typography 
        variant="h4" 
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Productos
      </Typography>


      <Button
        variant="contained"
        sx={{ 
          mb: 3,
          textTransform: "none"
        }}
      >
        ➕ Añadir Producto
      </Button>


      <Grid container spacing={2}>

        {categorias.map((categoria) => (

          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3}
            key={categoria.nombre}
          >

            
            <Paper
  elevation={3}
  onClick={() => {
    window.location.href = `/productos/categoria/${categoria.nombre}`;
  }}
  sx={{
    p: 2,
    height: 120,
    borderRadius: 3,
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    "&:hover": {
      transform: "scale(1.03)"
    },

    transition: "0.2s"
  }}
>

              <Box
                sx={{
                  fontSize: 30,
                  mb: 1
                }}
              >
                {categoria.icono}
              </Box>


              <Typography
                variant="h6"
                sx={{
                  fontSize: 17,
                  fontWeight: "bold"
                }}
              >
                {categoria.nombre}
              </Typography>


            </Paper>

          </Grid>

        ))}

      </Grid>

    </Box>
  );
}