import { useEffect, useState } from "react";
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

    fetch("http://192.168.1.67:3001/elaboraciones")
      .then((res) => res.json())
      .then((data) => setElaboraciones(data))
      .catch((err) => console.error(err));

  }, []);

  const guardarServicio = async () => {

    setGuardando(true);

    const hoy = new Date().toISOString().slice(0, 10);

    try {

      for (const e of elaboraciones) {

        const cantidad = cantidades[e.id] || 0;

        if (cantidad === 0) continue;

        await fetch("http://192.168.1.67:3001/ventas", {
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

        setGuardando(false)

      console.error(err);

      alert("Error guardando servicio");

    }

  };

  return (

    <Paper sx={{ p: 3 }}>

      <Typography variant="h4" gutterBottom>
        🍽 Servicio
      </Typography>

      <TextField
        select
        label="Turno"
        value={turno}
        onChange={(e) => setTurno(e.target.value)}
        sx={{ mb: 3, width: 220 }}
      >
        <MenuItem value="Mediodía">🌞 Mediodía</MenuItem>
        <MenuItem value="Noche">🌙 Noche</MenuItem>
      </TextField>

      <Typography sx={{ mb: 2 }}>
        Elaboraciones disponibles
      </Typography>

      <List>

        {elaboraciones.map((e) => (

          <ListItem key={e.id} divider>

            <ListItemText primary={e.nombre} />

            <Box display="flex" alignItems="center" gap={1}>

              <Button
                variant="outlined"
                onClick={() =>
                  setCantidades({
                    ...cantidades,
                    [e.id]: Math.max((cantidades[e.id] || 0) - 1, 0),
                  })
                }
              >
                -
              </Button>

              <Typography sx={{ width: 30, textAlign: "center" }}>
                {cantidades[e.id] || 0}
              </Typography>

              <Button
                variant="contained"
                onClick={() =>
                  setCantidades({
                    ...cantidades,
                    [e.id]: (cantidades[e.id] || 0) + 1,
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
  color="success"
  sx={{ mt: 3 }}
  onClick={guardarServicio}
  disabled={guardando}
>
  {guardando ? "Guardando..." : "💾 Guardar servicio"}
</Button>

    </Paper>

  );

}

export default Servicio;