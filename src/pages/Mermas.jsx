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
  Alert,
} from "@mui/material";

import {
  registrarMerma,
  obtenerMermas,
  anularMerma,
  obtenerEstadisticasMerma,
  obtenerLavoraciones,
  buscarProductosMerma,
} from "../services/mermasService";

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
  "pieza",
];

const FORMULARIO_INICIAL = {
  producto_id: "",
  lavorazione: "",
  cantidad_lavorada: "",
  unidad: "kg",
  cantidad_merma: "",
  unidad_merma: "g",
  responsable: "",
  observaciones: "",
};

const inputSx = {
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
  "& .MuiFormHelperText-root": {
    color: "#718091",
  },
  "& .MuiSvgIcon-root": {
    color: "#8f9baa",
  },
};

const paperSx = {
  p: { xs: 2, sm: 3 },
  my: 2,
  background: "#151a21",
  color: "#ffffff",
  border: "1px solid #252d38",
  borderRadius: "16px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.22)",
};

const tableHeadSx = {
  color: "#8f9baa",
  background: "#10151c",
  borderColor: "#303a47",
  fontWeight: 700,
  fontSize: "12px",
  whiteSpace: "nowrap",
};

const tableCellSx = {
  color: "#dce3eb",
  borderColor: "#252d38",
  fontSize: "12px",
};

function Mermas() {
  const [mermas, setMermas] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [lavoraciones, setLavoraciones] = useState([]);

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosEncontrados, setProductosEncontrados] =
    useState([]);

  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL
  );

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
      setEstadisticas(
        await obtenerEstadisticasMerma()
      );
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
    setFormulario((previo) => ({
      ...previo,
      [campo]: valor,
    }));
  }

  async function buscar() {
    setError(null);

    if (!busquedaProducto.trim()) {
      setError(
        "Escribe el nombre del producto a buscar"
      );
      return;
    }

    try {
      const resultados =
        await buscarProductosMerma(
          busquedaProducto
        );

      setProductosEncontrados(resultados);

      if (resultados.length === 0) {
        setError(
          `No encuentro productos para "${busquedaProducto}"`
        );
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
        producto_id: Number(
          formulario.producto_id
        ),
      });

      setMensaje(
        `Merma registrada: ${data.merma.cantidad_merma} ${data.merma.unidad} sobre ${data.merma.cantidad_lavorada} ${data.merma.unidad} · merma ${data.merma.porcentaje_merma}% · neto ${data.merma.cantidad_neta} ${data.merma.unidad}.`
      );

      setFormulario({
        ...FORMULARIO_INICIAL,
        producto_id:
          formulario.producto_id,
        unidad: formulario.unidad,
        responsable:
          formulario.responsable,
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
        motivo: "Anulada desde la interfaz",
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
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#0b0f14",
        color: "#ffffff",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
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
            NEXO · CONTROL
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: {
                xs: "28px",
                sm: "32px",
              },
            }}
          >
            📉 MERME · Merma real
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa",
              fontSize: "14px",
              mt: 0.7,
              maxWidth: "850px",
              lineHeight: 1.5,
            }}
          >
            Registra la merma real medida en cocina.
            Las rilevaciones se conservan siempre:
            para corregir una se anula y deja de contar
            en las estadísticas.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              my: 2,
              background: "#351c20",
              color: "#ffaaaa",
              border: "1px solid #663039",
              borderRadius: "10px",
              "& .MuiAlert-icon": {
                color: "#ff7777",
              },
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {mensaje && (
          <Alert
            severity="success"
            sx={{
              my: 2,
              background: "#172b20",
              color: "#9bf0b8",
              border: "1px solid #285f3a",
              borderRadius: "10px",
              "& .MuiAlert-icon": {
                color: "#6ee7a0",
              },
            }}
            onClose={() => setMensaje(null)}
          >
            {mensaje}
          </Alert>
        )}

        <Paper sx={paperSx}>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Nueva rilevazione
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 1.5,
              alignItems: "start",
              "@media (max-width: 900px)": {
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              },
              "@media (max-width: 600px)": {
                gridTemplateColumns:
                  "1fr",
              },
            }}
          >
            <TextField
              label="Buscar producto"
              value={busquedaProducto}
              onChange={(e) =>
                setBusquedaProducto(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") buscar();
              }}
              sx={inputSx}
            />

            <Button
              variant="outlined"
              onClick={buscar}
              sx={{
                minHeight: "56px",
                borderRadius: "10px",
                borderColor: "#303a47",
                color: "#00d9ff",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "#00d9ff",
                  background: "#101a20",
                },
              }}
            >
              🔍 Buscar
            </Button>

            <TextField
              select
              label="Producto"
              value={formulario.producto_id}
              onChange={(e) =>
                actualizar(
                  "producto_id",
                  e.target.value
                )
              }
              sx={inputSx}
            >
              <MenuItem value="">
                <em>Selecciona un producto</em>
              </MenuItem>

              {productosEncontrados.map((p) => (
                <MenuItem
                  key={p.id}
                  value={p.id}
                >
                  {p.nombre} ({p.unidad})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Lavorazione"
              value={formulario.lavorazione}
              onChange={(e) =>
                actualizar(
                  "lavorazione",
                  e.target.value
                )
              }
              helperText="Ej. mondatura"
              sx={inputSx}
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
              value={
                formulario.cantidad_lavorada
              }
              onChange={(e) =>
                actualizar(
                  "cantidad_lavorada",
                  e.target.value
                )
              }
              sx={inputSx}
            />

            <TextField
              select
              label="Unidad"
              value={formulario.unidad}
              onChange={(e) =>
                actualizar(
                  "unidad",
                  e.target.value
                )
              }
              sx={inputSx}
            >
              {UNIDADES.map((u) => (
                <MenuItem
                  key={u}
                  value={u}
                >
                  {u}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Cantidad merma"
              type="number"
              value={
                formulario.cantidad_merma
              }
              onChange={(e) =>
                actualizar(
                  "cantidad_merma",
                  e.target.value
                )
              }
              sx={inputSx}
            />

            <TextField
              select
              label="Unidad merma"
              value={
                formulario.unidad_merma
              }
              onChange={(e) =>
                actualizar(
                  "unidad_merma",
                  e.target.value
                )
              }
              sx={inputSx}
            >
              {UNIDADES.map((u) => (
                <MenuItem
                  key={u}
                  value={u}
                >
                  {u}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Responsable"
              value={
                formulario.responsable
              }
              onChange={(e) =>
                actualizar(
                  "responsable",
                  e.target.value
                )
              }
              sx={inputSx}
            />

            <TextField
              label="Observaciones"
              value={
                formulario.observaciones
              }
              onChange={(e) =>
                actualizar(
                  "observaciones",
                  e.target.value
                )
              }
              sx={inputSx}
            />

            <Button
              variant="contained"
              onClick={guardar}
              disabled={guardando}
              sx={{
                minHeight: "56px",
                borderRadius: "10px",
                background: "#00a8c7",
                color: "#ffffff",
                fontWeight: 700,
                "&:hover": {
                  background: "#0095b1",
                },
              }}
            >
              {guardando
                ? "Guardando..."
                : "💾 Registrar merma"}
            </Button>
          </Box>
        </Paper>

        <Paper sx={paperSx}>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Estadísticas acumuladas
            (media ponderada)
          </Typography>

          <Typography
            sx={{
              color: "#8f9baa",
              fontSize: "12px",
              mt: 0.5,
              mb: 2,
            }}
          >
            Agrupadas por producto + lavorazione.
            Calculadas como SUM(merma) / SUM(lavorado)
            · 100. Las rilevaciones anuladas no cuentan.
          </Typography>

          <TableContainer
            sx={{
              border: "1px solid #252d38",
              borderRadius: "10px",
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadSx}>
                    Producto
                  </TableCell>
                  <TableCell sx={tableHeadSx}>
                    Lavorazione
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Total lavorado
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Total merma
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Total neto
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    % merma
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    % resa
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    N. rilevazioni
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {estadisticas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{
                        ...tableCellSx,
                        py: 3,
                        color: "#718091",
                      }}
                    >
                      Todavía no hay estadísticas
                      de merma.
                    </TableCell>
                  </TableRow>
                ) : (
                  estadisticas.map((e) => (
                    <TableRow
                      key={`${e.producto_id}-${e.lavorazione}`}
                      sx={{
                        "&:hover": {
                          background:
                            "#10151c",
                        },
                      }}
                    >
                      <TableCell
                        sx={tableCellSx}
                      >
                        {e.producto_nombre}
                      </TableCell>

                      <TableCell
                        sx={tableCellSx}
                      >
                        {e.lavorazione}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          e.total_lavorado
                        ).toFixed(3)}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          e.total_merma
                        ).toFixed(3)}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          e.total_neto
                        ).toFixed(3)}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        <Chip
                          size="small"
                          label={`${e.porcentaje_merma_medio_ponderado}%`}
                          sx={{
                            background:
                              "#401f23",
                            color:
                              "#ff7777",
                            border:
                              "1px solid #663039",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        <Chip
                          size="small"
                          label={`${e.porcentaje_resa_medio_ponderado}%`}
                          sx={{
                            background:
                              "#172b20",
                            color:
                              "#6ee7a0",
                            border:
                              "1px solid #285f3a",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {e.numero_rilevazioni}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={paperSx}>
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Historial de rilevaciones
          </Typography>

          <TableContainer
            sx={{
              border: "1px solid #252d38",
              borderRadius: "10px",
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadSx}>
                    Fecha
                  </TableCell>
                  <TableCell sx={tableHeadSx}>
                    Producto
                  </TableCell>
                  <TableCell sx={tableHeadSx}>
                    Lavorazione
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Lavorado
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Merma
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    % merma
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Neto
                  </TableCell>
                  <TableCell sx={tableHeadSx}>
                    Responsable
                  </TableCell>
                  <TableCell sx={tableHeadSx}>
                    Estado
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={tableHeadSx}
                  >
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {mermas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      align="center"
                      sx={{
                        ...tableCellSx,
                        py: 3,
                        color: "#718091",
                      }}
                    >
                      Todavía no hay rilevaciones
                      de merma.
                    </TableCell>
                  </TableRow>
                ) : (
                  mermas.map((m) => (
                    <TableRow
                      key={m.id}
                      sx={{
                        "&:hover": {
                          background:
                            "#10151c",
                        },
                      }}
                    >
                      <TableCell
                        sx={tableCellSx}
                      >
                        {new Date(
                          m.fecha
                        ).toLocaleString()}
                      </TableCell>

                      <TableCell
                        sx={tableCellSx}
                      >
                        {m.producto_nombre}
                      </TableCell>

                      <TableCell
                        sx={tableCellSx}
                      >
                        {m.lavorazione}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          m.cantidad_lavorada
                        ).toFixed(3)}{" "}
                        {m.unidad}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          m.cantidad_merma
                        ).toFixed(3)}{" "}
                        {m.unidad}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {m.porcentaje_merma}%
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {Number(
                          m.cantidad_neta
                        ).toFixed(3)}{" "}
                        {m.unidad}
                      </TableCell>

                      <TableCell
                        sx={tableCellSx}
                      >
                        {m.responsable}
                      </TableCell>

                      <TableCell
                        sx={tableCellSx}
                      >
                        <Chip
                          size="small"
                          label={m.estado}
                          sx={{
                            background:
                              m.estado ===
                              "anulada"
                                ? "#252b33"
                                : "#172b20",
                            color:
                              m.estado ===
                              "anulada"
                                ? "#8f9baa"
                                : "#6ee7a0",
                            border:
                              "1px solid #303a47",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={tableCellSx}
                      >
                        {m.estado ===
                        "anulada" ? (
                          <Typography
                            sx={{
                              color:
                                "#718091",
                              fontSize:
                                "11px",
                            }}
                          >
                            anulada por{" "}
                            {m.anulado_por}
                          </Typography>
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              anular(m.id)
                            }
                            sx={{
                              minHeight:
                                "40px",
                              color:
                                "#ff7777",
                              borderRadius:
                                "8px",
                            }}
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
    </Box>
  );
}

export default Mermas;