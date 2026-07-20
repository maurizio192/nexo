import { Typography, Paper } from "@mui/material";

function Pedidos() {

  return (

    <Paper sx={{ p: 3 }}>

      <Typography variant="h4" gutterBottom>
        🛒 Pedidos
      </Typography>

      <Typography>
        Aquí aparecerán los pedidos automáticos agrupados por proveedor.
      </Typography>

    </Paper>

  );

}

export default Pedidos;