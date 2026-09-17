import { useEffect, useState } from "react";
import { API } from "../config/api";
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";

function Servicio() {
  const [elaboraciones, setElaboraciones] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [turno, setTurno] = useState("Mediodía");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetch(`${API}/elaboraciones`)
      .then((res) => res.json())
      .then((data) => setElaboraciones(data))
      .catch(console.error);
  }, []);

  const guardarServicio = async () => {
    setGuardando(true);

    const hoy = new Date().toISOString().slice(0, 10);

    try {
      for (const e of elaboraciones) {
        const cantidad = cantidades[e.id] || 0;

        if (cantidad === 0) continue;

        await fetch(`${API}/ventas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: hoy,
            turno,
            elaboracion: e.nombre,
            cantidad,
          }),
        });
      }

      alert("✅ Servicio guardado correctamente");

      setCantidades({});
      setGuardando(false);
    } catch (err) {
      setGuardando(false);

      console.error(err);

      alert("Error guardando servicio");
    }
  };

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
            NEXO · SERVICIO
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: { xs: "28px", sm: "32px" },
            }}
          >
            🍽 Servicio
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa",
              fontSize: "14px",
              mt: 0.5,
            }}
          >
            Registra las cantidades servidas por turno
          </Typography>
        </Box>

        <TextField
          select
          label="Turno"
          value={turno}
          onChange={(e) => setTurno(e.target.value)}
          sx={{
            mb: 3,
            width: { xs: "100%", sm: 240 },
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
            "& .MuiSvgIcon-root": {
              color: "#8f9baa",
            },
          }}
        >
          <MenuItem value="Mediodía">
            🌞 Mediodía
          </MenuItem>

          <MenuItem value="Noche">
            🌙 Noche
          </MenuItem>
        </TextField>

        <Typography
          sx={{
            mb: 1.5,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          Elaboraciones disponibles
        </Typography>

        <List sx={{ p: 0 }}>
          {elaboraciones.map((e) => (
            <ListItem
              key={e.id}
              sx={{
                background: "#10151c",
                border: "1px solid #252d38",
                borderRadius: "10px",
                mb: 1,
                px: 2,
                py: 1.3,
                gap: 2,
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {e.nombre}
                  </Typography>
                }
              />

              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ flexShrink: 0 }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: "44px",
                    minHeight: "44px",
                    borderRadius: "10px",
                    borderColor: "#303a47",
                    color: "#ffffff",
                    fontSize: "20px",
                    "&:hover": {
                      borderColor: "#00d9ff",
                    },
                  }}
                  onClick={() =>
                    setCantidades({
                      ...cantidades,
                      [e.id]: Math.max(
                        (cantidades[e.id] || 0) - 1,
                        0
                      ),
                    })
                  }
                >
                  −
                </Button>

                <Typography
                  sx={{
                    width: 36,
                    textAlign: "center",
                    color: "#00d9ff",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {cantidades[e.id] || 0}
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    minWidth: "44px",
                    minHeight: "44px",
                    borderRadius: "10px",
                    background: "#00a8c7",
                    color: "#ffffff",
                    fontSize: "20px",
                    "&:hover": {
                      background: "#0095b1",
                    },
                  }}
                  onClick={() =>
                    setCantidades({
                      ...cantidades,
                      [e.id]:
                        (cantidades[e.id] || 0) + 1,
                    })
                  }
                >
                  +
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 2,
            width: "100%",
            minHeight: "48px",
            borderRadius: "10px",
            background: "#00a8c7",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            "&:hover": {
              background: "#0095b1",
            },
          }}
          onClick={guardarServicio}
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : "💾 Guardar servicio"}
        </Button>
      </Paper>
    </div>
  );
}

export default Servicio;