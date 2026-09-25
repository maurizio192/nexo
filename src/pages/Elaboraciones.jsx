import { useEffect, useState } from "react";
import { Typography, Paper, TextField, Button, MenuItem } from "@mui/material";
import { API } from "../config/api";

function Elaboraciones() {
  const [elaboraciones, setElaboraciones] = useState([]);
  const [recetas, setRecetas] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [elaboracionSeleccionada, setElaboracionSeleccionada] =
    useState(null);
  const [ficha, setFicha] = useState(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [diasConservacion, setDiasConservacion] = useState("");
  const [tipoConservacion, setTipoConservacion] = useState("");
  const [recetaId, setRecetaId] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function cargarElaboraciones() {
    try {
      const res = await fetch(API + "/elaboraciones");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error al cargar las elaboraciones"
        );
      }

      setElaboraciones(data);
    } catch (err) {
      console.error(err);
      setMensaje("❌ " + err.message);
    }
  }

  async function cargarRecetas() {
    try {
      const res = await fetch(API + "/recetas");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error al cargar las recetas"
        );
      }

      setRecetas(data);
    } catch (err) {
      console.error(err);
      setMensaje("❌ " + err.message);
    }
  }

  useEffect(() => {
    cargarElaboraciones();
    cargarRecetas();
  }, []);

  async function abrirFicha(elaboracion) {
    setMensaje("");
    setCargandoFicha(true);
    setElaboracionSeleccionada(elaboracion);
    setFicha(null);

    try {
      const res = await fetch(
        API + "/elaboraciones/" + elaboracion.id
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Error al cargar la ficha"
        );
      }

      setFicha(data);
    } catch (err) {
      console.error(err);
      setMensaje("❌ " + err.message);
    } finally {
      setCargandoFicha(false);
    }
  }

  function cerrarFicha() {
    setElaboracionSeleccionada(null);
    setFicha(null);
    setMensaje("");
  }

  function limpiarFormulario() {
    setNombre("");
    setCategoria("");
    setDiasConservacion("");
    setTipoConservacion("");
    setRecetaId("");
    setMensaje("");
  }

  async function guardarElaboracion() {
    setMensaje("");

    if (!nombre.trim()) {
      setMensaje("❌ El nombre es obligatorio");
      return;
    }

    try {
      const res = await fetch(API + "/elaboraciones", {
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
        throw new Error(
          data.error || "Error al guardar la elaboración"
        );
      }

      setMensaje("✅ Elaboración guardada correctamente");
      limpiarFormulario();
      setMostrarFormulario(false);

      await cargarElaboraciones();
    } catch (err) {
      console.error(err);
      setMensaje("❌ " + err.message);
    }
  }

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
      minHeight: "52px",

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

    "& .MuiSelect-icon": {
      color: "#8f9baa",
    },
  };

  /*
   * ==========================================================
   * FICHA INDIVIDUAL
   * ==========================================================
   */

  if (elaboracionSeleccionada) {
    const e = ficha?.elaboracion || elaboracionSeleccionada;
    const ingredientes = ficha?.ingredientes || [];
    const pasos = ficha?.pasos || [];
    const alergenos = ficha?.alergenos || [];

    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          background: "#0b0f14",
          color: "#ffffff",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {/* CABECERA */}

          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <Button
              onClick={cerrarFicha}
              sx={{
                minHeight: "44px",
                px: 1.5,
                mb: 2,
                borderRadius: "10px",
                color: "#aeb8c5",
                border: "1px solid #303a47",
                textTransform: "none",
                fontWeight: 700,

                "&:hover": {
                  background: "#151a21",
                  borderColor: "#4b5a6b",
                },
              }}
            >
              ← Volver a Elaboraciones
            </Button>

            <div
              style={{
                color: "#00d9ff",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              NEXO · LIBRO MAESTRO
            </div>

            <h1
              style={{
                margin: 0,
                color: "#d7f7ff",
                fontSize: "32px",
                fontWeight: "700",
                lineHeight: "1.15",
              }}
            >
              🧑‍🍳 {e.nombre}
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#8f9baa",
                fontSize: "15px",
              }}
            >
              {e.categoria || "Sin categoría"}
            </p>
          </div>

          {mensaje && (
            <div
              style={{
                marginBottom: "20px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "#2a1818",
                border: "1px solid #5a3030",
                color: "#ffb0b0",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {mensaje}
            </div>
          )}

          {cargandoFicha && (
            <div
              style={{
                background: "#151a21",
                border: "1px solid #252d38",
                borderRadius: "14px",
                padding: "30px",
                textAlign: "center",
                color: "#8f9baa",
              }}
            >
              Cargando ficha...
            </div>
          )}

          {!cargandoFicha && ficha && (
            <>
              {/* RESUMEN */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(145px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "17px",
                  }}
                >
                  <div
                    style={{
                      color: "#647180",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Rendimiento
                  </div>

                  <div
                    style={{
                      color: "#d7f7ff",
                      fontSize: "22px",
                      fontWeight: "700",
                    }}
                  >
                    {e.rendimiento ?? "—"}{" "}
                    {e.unidad || ""}
                  </div>
                </div>

                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "17px",
                  }}
                >
                  <div
                    style={{
                      color: "#647180",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Stock actual
                  </div>

                  <div
                    style={{
                      color:
                        Number(e.bolsas_actuales || 0) <=
                        Number(e.stock_minimo || 0)
                          ? "#ffb0b0"
                          : "#8ff0bd",
                      fontSize: "22px",
                      fontWeight: "700",
                    }}
                  >
                    {e.bolsas_actuales ?? 0}{" "}
                    {e.unidad || ""}
                  </div>
                </div>

                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "17px",
                  }}
                >
                  <div
                    style={{
                      color: "#647180",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Stock mínimo
                  </div>

                  <div
                    style={{
                      color: "#d7dfe7",
                      fontSize: "22px",
                      fontWeight: "700",
                    }}
                  >
                    {e.stock_minimo ?? "—"}{" "}
                    {e.unidad || ""}
                  </div>
                </div>

                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "17px",
                  }}
                >
                  <div
                    style={{
                      color: "#647180",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    Producir
                  </div>

                  <div
                    style={{
                      color: "#d7f7ff",
                      fontSize: "22px",
                      fontWeight: "700",
                    }}
                  >
                    {e.producir ?? "—"}
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE PRODUCCIÓN */}

              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "#7f8b99",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  ⚙️ Producción y conservación
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#647180",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Conservación
                    </div>

                    <div
                      style={{
                        color: "#d7dfe7",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {e.tipo_conservacion || "No definida"}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#647180",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Días de conservación
                    </div>

                    <div
                      style={{
                        color: "#d7dfe7",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {e.dias_conservacion != null
                        ? `${e.dias_conservacion} días`
                        : "No definido"}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#647180",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Abatidor
                    </div>

                    <div
                      style={{
                        color: e.usa_abatidor
                          ? "#8ff0bd"
                          : "#d7dfe7",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {e.usa_abatidor ? "Sí" : "No"}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#647180",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      Congelación
                    </div>

                    <div
                      style={{
                        color: e.se_congela
                          ? "#d7f7ff"
                          : "#d7dfe7",
                        fontSize: "15px",
                        fontWeight: "600",
                      }}
                    >
                      {e.se_congela ? "Sí" : "No"}
                    </div>
                  </div>

                  {e.temperatura != null && (
                    <div>
                      <div
                        style={{
                          color: "#647180",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        Temperatura
                      </div>

                      <div
                        style={{
                          color: "#d7dfe7",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        {e.temperatura}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* INGREDIENTES */}

              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "#7f8b99",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  🧂 Ingredientes
                </div>

                {ingredientes.length === 0 ? (
                  <div
                    style={{
                      color: "#7f8b99",
                      fontSize: "14px",
                    }}
                  >
                    No hay ingredientes registrados.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {ingredientes.map((ingrediente) => (
                      <div
                        key={ingrediente.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "15px",
                          padding: "12px 13px",
                          background: "#10151c",
                          border: "1px solid #202934",
                          borderRadius: "9px",
                        }}
                      >
                        <div
                          style={{
                            color: "#d7dfe7",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          {ingrediente.ingrediente}
                        </div>

                        <div
                          style={{
                            color: "#00d9ff",
                            fontSize: "14px",
                            fontWeight: "700",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ingrediente.cantidad}{" "}
                          {ingrediente.unidad}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROCEDIMIENTO */}

              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    color: "#7f8b99",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  👨‍🍳 Preparación
                </div>

                {pasos.length === 0 ? (
                  <div
                    style={{
                      color: "#7f8b99",
                      fontSize: "14px",
                    }}
                  >
                    No hay pasos de preparación registrados.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {pasos.map((paso, index) => (
                      <div
                        key={paso.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "13px",
                        }}
                      >
                        <div
                          style={{
                            flex: "0 0 30px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "#102630",
                            border: "1px solid #00a8c7",
                            color: "#00d9ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "800",
                          }}
                        >
                          {paso.orden || index + 1}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            paddingTop: "5px",
                            color: "#d7dfe7",
                            fontSize: "15px",
                            lineHeight: "1.55",
                          }}
                        >
                          {paso.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ALÉRGENOS */}

              {alergenos.length > 0 && (
                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      color: "#7f8b99",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    ⚠️ Alérgenos
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {alergenos.map((alergeno) => (
                      <div
                        key={alergeno.id}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "20px",
                          background: "#2a1f18",
                          border: "1px solid #60452d",
                          color: "#ffc48a",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {alergeno.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OBSERVACIONES */}

              {(e.receta_observaciones ||
                e.observaciones ||
                e.procedimiento) && (
                <div
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      color: "#7f8b99",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                    }}
                  >
                    📝 Observaciones
                  </div>

                  <div
                    style={{
                      color: "#d7dfe7",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {e.receta_observaciones ||
                      e.observaciones ||
                      e.procedimiento}
                  </div>
                </div>
              )}

              {/* BOTÓN VOLVER */}

              <Button
                fullWidth
                onClick={cerrarFicha}
                sx={{
                  minHeight: "52px",
                  borderRadius: "10px",
                  color: "#d7dfe7",
                  border: "1px solid #303a47",
                  background: "#151a21",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "15px",

                  "&:hover": {
                    background: "#1b222b",
                    borderColor: "#4b5a6b",
                  },
                }}
              >
                ← Volver al catálogo de elaboraciones
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * CATÁLOGO DE ELABORACIONES
   * ==========================================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* CABECERA */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#00d9ff",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              NEXO · LIBRO MAESTRO
            </div>

            <h1
              style={{
                margin: 0,
                color: "#d7f7ff",
                fontSize: "30px",
                fontWeight: "700",
                lineHeight: "1.15",
              }}
            >
              🧑‍🍳 Elaboraciones
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#8f9baa",
                fontSize: "14px",
              }}
            >
              Bases, fondos, salsas y preparaciones de cocina
            </p>
          </div>

          <Button
            variant="contained"
            onClick={() => {
              limpiarFormulario();
              setMostrarFormulario(!mostrarFormulario);
            }}
            sx={{
              minHeight: "48px",
              px: 2.5,
              borderRadius: "10px",
              background: "#00a8c7",
              color: "#ffffff",
              fontWeight: 800,

              "&:hover": {
                background: "#0095b1",
              },
            }}
          >
            {mostrarFormulario
              ? "✕ Cerrar"
              : "＋ Nueva elaboración"}
          </Button>
        </div>

        {/* MENSAJE */}

        {mensaje && (
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: mensaje.startsWith("✅")
                ? "#102a20"
                : "#2a1818",
              border: mensaje.startsWith("✅")
                ? "1px solid #245b43"
                : "1px solid #5a3030",
              color: mensaje.startsWith("✅")
                ? "#8ff0bd"
                : "#ffb0b0",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </div>
        )}

        {/* FORMULARIO */}

        {mostrarFormulario && (
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              background: "#151a21",
              color: "#ffffff",
              border: "1px solid #252d38",
              borderRadius: "16px",
            }}
          >
            <Typography
              sx={{
                color: "#d7f7ff",
                fontSize: "18px",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Nueva elaboración
            </Typography>

            <Typography
              sx={{
                color: "#7f8b99",
                fontSize: "13px",
                mb: 2,
              }}
            >
              Vincula una receta o crea una elaboración independiente.
            </Typography>

            <TextField
              select
              fullWidth
              label="Receta"
              margin="normal"
              value={recetaId}
              onChange={(e) => {
                const idSeleccionado = e.target.value;

                setRecetaId(idSeleccionado);

                const receta = recetas.find(
                  (r) =>
                    String(r.id) ===
                    String(idSeleccionado)
                );

                if (receta) {
                  setNombre(receta.nombre || "");
                  setCategoria(receta.categoria || "");
                }
              }}
              sx={inputSx}
            >
              {recetas.map((receta) => (
                <MenuItem
                  key={receta.id}
                  value={receta.id}
                >
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
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Categoría"
              margin="normal"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value)
              }
              sx={inputSx}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <TextField
                fullWidth
                type="number"
                label="Días de conservación"
                margin="normal"
                value={diasConservacion}
                onChange={(e) =>
                  setDiasConservacion(e.target.value)
                }
                sx={inputSx}
              />

              <TextField
                select
                fullWidth
                label="Tipo de conservación"
                margin="normal"
                value={tipoConservacion}
                onChange={(e) =>
                  setTipoConservacion(e.target.value)
                }
                sx={inputSx}
              >
                <MenuItem value="Nevera">
                  Nevera
                </MenuItem>

                <MenuItem value="Congelador">
                  Congelador
                </MenuItem>

                <MenuItem value="Ambiente">
                  Ambiente
                </MenuItem>
              </TextField>
            </div>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={guardarElaboracion}
              sx={{
                mt: 3,
                minHeight: "52px",
                borderRadius: "10px",
                background: "#00a8c7",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "15px",

                "&:hover": {
                  background: "#0095b1",
                },
              }}
            >
              🧑‍🍳 Guardar Elaboración
            </Button>
          </Paper>
        )}

        {/* CATÁLOGO */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {elaboraciones.map((elaboracion) => (
            <div
              key={elaboracion.id}
              onClick={() => abrirFicha(elaboracion)}
              style={{
                background: "#151a21",
                border: "1px solid #252d38",
                borderRadius: "14px",
                padding: "18px",
                minHeight: "150px",
                boxSizing: "border-box",
                cursor: "pointer",
                transition:
                  "transform 0.15s ease, border-color 0.15s ease",
                WebkitTapHighlightColor:
                  "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "#00a8c7";
                e.currentTarget.style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "#252d38";
                e.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                {elaboracion.nombre}
              </div>

              <div
                style={{
                  color: "#00d9ff",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "14px",
                }}
              >
                {elaboracion.categoria ||
                  "Sin categoría"}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "8px",
                  color: "#8f9baa",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#647180",
                    }}
                  >
                    Rendimiento
                  </span>

                  <br />

                  <strong
                    style={{
                      color: "#d7dfe7",
                    }}
                  >
                    {elaboracion.rendimiento ??
                      "—"}{" "}
                    {elaboracion.unidad || ""}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      color: "#647180",
                    }}
                  >
                    Stock actual
                  </span>

                  <br />

                  <strong
                    style={{
                      color: "#d7dfe7",
                    }}
                  >
                    {elaboracion.bolsas_actuales ??
                      0}
                    {elaboracion.unidad
                      ? " " + elaboracion.unidad
                      : ""}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  color: "#647180",
                  fontSize: "12px",
                  textAlign: "right",
                }}
              >
                Ver ficha →
              </div>
            </div>
          ))}
        </div>

        {elaboraciones.length === 0 && (
          <div
            style={{
              background: "#151a21",
              border: "1px solid #252d38",
              borderRadius: "14px",
              padding: "35px 20px",
              textAlign: "center",
              color: "#7f8b99",
            }}
          >
            No hay elaboraciones registradas todavía.
          </div>
        )}
      </div>
    </div>
  );
}

export default Elaboraciones;
