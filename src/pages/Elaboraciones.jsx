import { useEffect, useState } from "react";
import { Typography, Paper, TextField, Button, MenuItem } from "@mui/material";
import { API } from "../config/api";

function Elaboraciones() {

  const [nombre, setNombre] = useState("");
const [categoria, setCategoria] = useState("");
const [diasConservacion, setDiasConservacion] = useState("");
const [tipoConservacion, setTipoConservacion] = useState("");
const [recetaId, setRecetaId] = useState("");
const [recetas, setRecetas] = useState([]);
const [mensaje, setMensaje] = useState("");

useEffect(() => {
  async function cargarRecetas() {
    try {
      const res = await fetch(`${API}/recetas`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar las recetas");
      }

      setRecetas(data);
    } catch (err) {
      console.error(err);
      setMensaje(`❌ ${err.message}`);
    }
  }

  cargarRecetas();
}, []);

  async function guardarElaboracion() {

    setMensaje("");

    if (!nombre.trim()) {
      setMensaje("❌ El nombre es obligatorio");
      return;
    }

    try {

      const res = await fetch(`${API}/elaboraciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

       body: JSON.stringify({
  nombre: nombre.trim(),
  categoria: categoria.trim(),
  dias_conservacion: diasConservacion
    ? Number(diasConservacion)
    : null,
  tipo_conservacion: tipoConservacion,

  receta_id: recetaId ? Number(recetaId) : null,
activa: true,
}),
});

const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la elaboración");
      }

      setMensaje("✅ Elaboración guardada correctamente");

      setNombre("");
      setCategoria("");
      setDiasConservacion("");
      setTipoConservacion("");

    } catch (err) {

      console.error(err);
      setMensaje(`❌ ${err.message}`);

    }
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        📖 Elaboraciones
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>

<TextField
  select
  fullWidth
  label="Receta"
  margin="normal"
  value={recetaId}
  onChange={(e) => {
    const idSeleccionado = e.target.value;
    setRecetaId(idSeleccionado);

    const recetaSeleccionada = recetas.find(
      (r) => String(r.id) === String(idSeleccionado)
    );

    if (recetaSeleccionada) {
      setNombre(recetaSeleccionada.nombre || "");
      setCategoria(recetaSeleccionada.categoria || "");
    }
  }}
>
  {recetas.map((receta) => (
    <MenuItem key={receta.id} value={receta.id}>
      {receta.nombre}
    </MenuItem>
  ))}
</TextField>

        <TextField
          fullWidth
          label="Nombre"
          margin="normal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
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
          type="number"
          label="Días de conservación"
          margin="normal"
          value={diasConservacion}
          onChange={(e) => setDiasConservacion(e.target.value)}
        />

        <TextField
          select
          fullWidth
          label="Tipo de conservación"
          margin="normal"
          value={tipoConservacion}
          onChange={(e) => setTipoConservacion(e.target.value)}
        >
          <MenuItem value="Nevera">Nevera</MenuItem>
          <MenuItem value="Congelador">Congelador</MenuItem>
          <MenuItem value="Ambiente">Ambiente</MenuItem>
        </TextField>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={guardarElaboracion}
        >
          Guardar Elaboración
        </Button>

        {mensaje && (
          <Typography sx={{ mt: 2 }}>
            {mensaje}
          </Typography>
        )}

      </Paper>
    </>
  );
}

export default Elaboraciones;
