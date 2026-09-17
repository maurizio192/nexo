import { Typography, Paper, TextField, Button, Box } from "@mui/material";

function Producciones() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: "#00d9ff",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          NEXO · COCINA
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: { xs: "28px", sm: "32px" },
          }}
        >
          👨‍🍳 Producciones
        </Typography>

        <Typography
          sx={{
            color: "#8f9baa",
            fontSize: "14px",
            mt: 0.5,
          }}
        >
          Registro de producción de elaboraciones
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          background: "#151a21",
          color: "#ffffff",
          border: "1px solid #252d38",
          borderRadius: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
        }}
      >
        <TextField
          fullWidth
          label="Elaboración"
          margin="normal"
          sx={{
            "& .MuiInputLabel-root": {
              color: "#8f9baa",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00d9ff",
            },
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              background: "#10151c",
              borderRadius: "10px",
              "& fieldset": {
                borderColor: "#303a47",
              },
              "&:hover fieldset": {
                borderColor: "#4b5a6b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00d9ff",
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Responsable"
          margin="normal"
          sx={{
            "& .MuiInputLabel-root": {
              color: "#8f9baa",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00d9ff",
            },
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              background: "#10151c",
              borderRadius: "10px",
              "& fieldset": {
                borderColor: "#303a47",
              },
              "&:hover fieldset": {
                borderColor: "#4b5a6b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00d9ff",
              },
            },
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Cantidad de bolsas"
          margin="normal"
          sx={{
            "& .MuiInputLabel-root": {
              color: "#8f9baa",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#00d9ff",
            },
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              background: "#10151c",
              borderRadius: "10px",
              "& fieldset": {
                borderColor: "#303a47",
              },
              "&:hover fieldset": {
                borderColor: "#4b5a6b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00d9ff",
              },
            },
          }}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            mt: 2,
            minHeight: "48px",
            borderRadius: "10px",
            background: "#00a8c7",
            color: "#ffffff",
            fontWeight: 700,
            "&:hover": {
              background: "#0095b1",
            },
          }}
        >
          Guardar Producción
        </Button>
      </Paper>
    </div>
  );
}

export default Producciones;