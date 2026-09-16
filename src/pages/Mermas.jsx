import { useEffect, useState } from "react";

import {
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert
} from "@mui/material";

import {
  registrarMerma,
  obtenerMermas,
  anularMerma,
  obtenerEstadisticasMerma,
  obtenerLavoraciones,
  buscarProductosMerma
} from "../services/mermasService";

/*
|--------------------------------------------------------------------------
| NEXO - MERME (merma real medida en cocina)
|--------------------------------------------------------------------------
| Registro historico de rilevaciones de merma.
| Las rilevaciones NO se borran: se anulan y quedan en el historial,
| excluyendose de las estadisticas (media ponderada).
*/

const UNIDADES = [
  "kg",
  "g",
  "l",
  "ml",
  "ud",
  "caja",
  "bolsa",
  "paquete",
  "botella",
  "bote",
  "pieza"
];

const FORMULARIO_INICIAL = {
  producto_id: "",
  lavorazione: "",
  cantidad_lavorada: "",
  unidad: "kg",
  cantidad_merma: "",
  unidad_merma: "g",
  responsable: "",
  observaciones: ""
};

function Mermas() {

  const [mermas, setMermas] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [lavoraciones, setLavoraciones] = useState([]);

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosEncontrados, setProductosEncontrados] = useState([]);

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  useEffect(() => {
    cargarMermas();
    cargarEstadisticas();
    cargarLavoraciones();
  }, []);

  async function cargarMermas() {
    try {
      setMermas(await obtenerMermas());
    } catch (err) {
      setError(err.message);
    }
  }

  async function cargarEstadisticas() {
    try {
      setEstadisticas(await obtenerEstadisticasMerma());
    } catch (err) {
      setError(err.message);
    }
  }

  async function cargarLavoraciones() {
    try {
      setLavoraciones(await obtenerLavoraciones());
    } catch (err) {
      console.error(err);
    }
  }

  function actualizar(campo, valor) {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  }

  async function buscar() {

    setError(null);

    if (!busquedaProducto.trim()) {
      setError("Escribe el nombre del producto a buscar");
      return;
    }

    try {

      const resultados = await buscarProductosMerma(busquedaProducto);

      setProductosEncontrados(resultados);

      if (resultados.length === 0) {
        setError(`No encuentro productos para "${busquedaProducto}"`);
      }

    } catch (err) {
      setError(err.message);
    }
  }

  async function guardar() {

    setError(null);
    setMensaje(null);

    if (!formulario.producto_id) {
      setError("Selecciona un producto");
      return;
    }

    setGuardando(true);

    try {

      const data = await registrarMerma({
        ...formulario,
        producto_id: Number(formulario.producto_id)
      });

      setMensaje(
        `Merma registrada: ${data.merma.cantidad_merma} ${data.merma.unidad} sobre ${data.merma.cantidad_lavorada} ${data.merma.unidad} · merma ${data.merma.porcentaje_merma}% · neto ${data.merma.cantidad_neta} ${data.merma.unidad}.`
      );

      setFormulario({
        ...FORMULARIO_INICIAL,
        producto_id: formulario.producto_id,
        unidad: formulario.unidad,
        responsable: formulario.responsable
      });

      await cargarMermas();
      await cargarEstadisticas();
      await cargarLavoraciones();

    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular(id) {

    setError(null);
    setMensaje(null);

    try {

      await anularMerma(id, {
        responsable: "UI Mermas",
        motivo: "Anulada desde la interfaz"
      });

      setMensaje(
        `Rilevazione #${id} anulada. El historial se conserva y ya no cuenta en las estadísticas.`
      );

      await cargarMermas();
      await cargarEstadisticas();

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📉 MERME · Merma real
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Registra la merma real medida en cocina. Las rilevaciones se conservan
        siempre: para corregir una se anula y deja de contar en las estadísticas.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ my: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert
          severity="success"
          sx={{ my: 2 }}
          onClose={() => setMensaje(null)}
        >
          {mensaje}
        </Alert>
      )}

      <Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Nueva rilevazione
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "flex-start"
          }}
        >
          <TextField
            label="Buscar producto"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") buscar();
            }}
            sx={{ minWidth: 240 }}
          />

          <Button
            variant="outlined"
            onClick={buscar}
            sx={{ height: 56 }}
          >
            🔍 Buscar
          </Button>

          <TextField
            select
            label="Producto"
            value={formulario.producto_id}
            onChange={(e) => actualizar("producto_id", e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">
              <em>Selecciona un producto</em>
            </MenuItem>
            {productosEncontrados.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre} ({p.unidad})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
          <TextField
            label="Lavorazione"
            value={formulario.lavorazione}
            onChange={(e) => actualizar("lavorazione", e.target.value)}
            helperText="Ej. mondatura"
            sx={{ minWidth: 220 }}
            list="lavoraciones-merma"
          />
          <datalist id="lavoraciones-merma">
            {lavoraciones.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>

          <TextField
            label="Cantidad lavorada"
            type="number"
            value={formulario.cantidad_lavorada}
            onChange={(e) => actualizar("cantidad_lavorada", e.target.value)}
            sx={{ width: 170 }}
          />

          <TextField
            select
            label="Unidad"
            value={formulario.unidad}
            onChange={(e) => actualizar("unidad", e.target.value)}
            sx={{ width: 120 }}
          >
            {UNIDADES.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Cantidad merma"
            type="number"
            value={formulario.cantidad_merma}
            onChange={(e) => actualizar("cantidad_merma", e.target.value)}
            sx={{ width: 170 }}
          />

          <TextField
            select
            label="Unidad merma"
            value={formulario.unidad_merma}
            onChange={(e) => actualizar("unidad_merma", e.target.value)}
            sx={{ width: 130 }}
          >
            {UNIDADES.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Responsable"
            value={formulario.responsable}
            onChange={(e) => actualizar("responsable", e.target.value)}
            sx={{ minWidth: 180 }}
          />

          <TextField
            label="Observaciones"
            value={formulario.observaciones}
            onChange={(e) => actualizar("observaciones", e.target.value)}
            sx={{ minWidth: 220, flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={guardar}
            disabled={guardando}
            sx={{ height: 56 }}
          >
            {guardando ? "Guardando..." : "💾 Registrar merma"}
          </Button>
        </Box>
      </Paper>
<Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h6" gutterBottom>
           Estadísticas acumuladas (media ponderada)
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Agrupadas por producto + lavorazione. Calculadas como
          SUM(merma) / SUM(lavorado) · 100. Las rilevaciones anuladas no cuentan.
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Lavorazione</TableCell>
                <TableCell align="right">Total lavorado</TableCell>
                <TableCell align="right">Total merma</TableCell>
                <TableCell align="right">Total neto</TableCell>
                <TableCell align="right">% merma</TableCell>
                <TableCell align="right">% resa</TableCell>
                <TableCell align="right">N. rilevazioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estadisticas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Todavía no hay estadísticas de merma.
                  </TableCell>
                </TableRow>
              ) : (
                estadisticas.map((e) => (
                  <TableRow key={`${e.producto_id}-${e.lavorazione}`}>
                    <TableCell>{e.producto_nombre}</TableCell>
                    <TableCell>{e.lavorazione}</TableCell>
                    <TableCell align="right">
                      {Number(e.total_lavorado).toFixed(3)}
                    </TableCell>
                    <TableCell align="right">
                      {Number(e.total_merma).toFixed(3)}
                    </TableCell>
                    <TableCell align="right">
                      {Number(e.total_neto).toFixed(3)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        color="error"
                        label={`${e.porcentaje_merma_medio_ponderado}%`}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        color="success"
                        label={`${e.porcentaje_resa_medio_ponderado}%`}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {e.numero_rilevazioni}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Historial de rilevaciones
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Lavorazione</TableCell>
                <TableCell align="right">Lavorado</TableCell>
                <TableCell align="right">Merma</TableCell>
                <TableCell align="right">% merma</TableCell>
                <TableCell align="right">Neto</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Accion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mermas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Todavia no hay rilevaciones de merma.
                  </TableCell>
                </TableRow>
              ) : (
                mermas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {new Date(m.fecha).toLocaleString()}
                    </TableCell>
                    <TableCell>{m.producto_nombre}</TableCell>
                    <TableCell>{m.lavorazione}</TableCell>
                    <TableCell align="right">
                      {Number(m.cantidad_lavorada).toFixed(3)} {m.unidad}
                    </TableCell>
                    <TableCell align="right">
                      {Number(m.cantidad_merma).toFixed(3)} {m.unidad}
                    </TableCell>
                    <TableCell align="right">
                      {m.porcentaje_merma}%
                    </TableCell>
                    <TableCell align="right">
                      {Number(m.cantidad_neta).toFixed(3)} {m.unidad}
                    </TableCell>
                    <TableCell>{m.responsable}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={m.estado === "anulada" ? "default" : "primary"}
                        label={m.estado}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {m.estado === "anulada" ? (
                        <Typography variant="caption" color="text.secondary">
                          anulada por {m.anulado_por}
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => anular(m.id)}
                        >
                          Anular
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Mermas;
