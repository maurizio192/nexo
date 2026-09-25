import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../config/api";

export default function RecetaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState("ingredientes");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);

        const respuesta = await fetch(API + "/recetas/" + id);

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar la receta");
        }

        const data = await respuesta.json();
        setDatos(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la receta.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0f14",
          color: "#d7f7ff",
          padding: "30px",
        }}
      >
        Cargando receta...
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0f14",
          color: "#ffffff",
          padding: "30px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <p style={{ color: "#ff8f8f" }}>{error || "Receta no encontrada."}</p>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: "15px",
              background: "#00d9ff",
              color: "#071016",
              border: 0,
              borderRadius: "10px",
              padding: "13px 18px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const receta = datos.receta || {};
  const ingredientes = datos.ingredientes || [];
  const pasos = datos.pasos || [];
  const alergenos = datos.alergenos || [];

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
        <div style={{ marginBottom: "22px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "transparent",
              border: "1px solid #303945",
              color: "#aeb8c4",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
            }}
          >
            ← Volver
          </button>

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
              lineHeight: "1.1",
              fontWeight: "800",
            }}
          >
            {receta.nombre}
          </h1>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{
                background: "#18242b",
                border: "1px solid #24434d",
                color: "#7feaff",
                padding: "6px 10px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {receta.categoria}
            </span>

            {receta.codigo && (
              <span
                style={{
                  background: "#151a21",
                  border: "1px solid #303945",
                  color: "#aeb8c4",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontSize: "13px",
                }}
              >
                {receta.codigo}
              </span>
            )}
          </div>
        </div>

        {/* INFORMACIÓN DE PRODUCCIÓN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            ["Producción", receta.unidad_produccion],
            ["Unidades", receta.unidades_producidas],
            ["Raciones / unidad", receta.raciones_por_unidad],
            ["Consumo servicio", receta.consumo_servicio],
            ["Preparación", receta.tiempo_preparacion ? receta.tiempo_preparacion + " min" : null],
            ["Cocción", receta.tiempo_coccion ? receta.tiempo_coccion + " min" : null],
          ].map(([titulo, valor]) => (
            <div
              key={titulo}
              style={{
                background: "#151a21",
                border: "1px solid #252d38",
                borderRadius: "12px",
                padding: "14px",
                minHeight: "68px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  color: "#7f8b99",
                  fontSize: "12px",
                  marginBottom: "5px",
                }}
              >
                {titulo}
              </div>

              <div
                style={{
                  color: "#d7f7ff",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                {valor !== null && valor !== undefined && valor !== ""
                  ? valor
                  : "—"}
              </div>
            </div>
          ))}
        </div>

        {/* ALÉRGENOS */}
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
            Alérgenos
          </div>

          {alergenos.length === 0 ? (
            <div
              style={{
                color: "#8f9baa",
                fontSize: "14px",
              }}
            >
              Sin alérgenos registrados.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {alergenos.map((alergeno, index) => (
                <span
                  key={alergeno.id || index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "#2a2020",
                    border: "1px solid #5a3838",
                    color: "#ffd4d4",
                    padding: "8px 11px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  {alergeno.icono || "⚠️"}
                  {alergeno.nombre || alergeno.codigo}
                </span>
              ))}
            </div>
          )}
        </div>

         {receta.emplatado && (
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
      🍽️ Emplatado
    </div>

    <div
      style={{
        color: "#d7dfe7",
        fontSize: "16px",
        lineHeight: "1.65",
        whiteSpace: "pre-line",
      }}
    >
      {receta.emplatado}
    </div>
  </div>
)}

        {/* PESTAÑAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <button
            onClick={() => setPestana("ingredientes")}
            style={{
              minHeight: "48px",
              borderRadius: "10px",
              border:
                pestana === "ingredientes"
                  ? "1px solid #00d9ff"
                  : "1px solid #303945",
              background:
                pestana === "ingredientes" ? "#102a31" : "#151a21",
              color:
                pestana === "ingredientes" ? "#7feaff" : "#aeb8c4",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            🧂 Ingredientes
          </button>

          <button
            onClick={() => setPestana("procedimiento")}
            style={{
              minHeight: "48px",
              borderRadius: "10px",
              border:
                pestana === "procedimiento"
                  ? "1px solid #00d9ff"
                  : "1px solid #303945",
              background:
                pestana === "procedimiento" ? "#102a31" : "#151a21",
              color:
                pestana === "procedimiento" ? "#7feaff" : "#aeb8c4",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            👨‍🍳 Preparación
          </button>
        </div>

        {/* INGREDIENTES */}
        {pestana === "ingredientes" && (
          <div>
            {ingredientes.length === 0 ? (
              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#aeb8c4",
                }}
              >
                No hay ingredientes registrados.
              </div>
            ) : (
              ingredientes.map((ingrediente, index) => (
                <div
                  key={ingrediente.id || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "12px",
                    padding: "15px 16px",
                    marginBottom: "9px",
                  }}
                >
                  <div
                    style={{
                      color: "#d7f7ff",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    {ingrediente.ingrediente}
                  </div>

                  <div
                    style={{
                      color: "#8f9baa",
                      fontSize: "15px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ingrediente.cantidad ?? "—"} {ingrediente.unidad || ""}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PREPARACIÓN */}
        {pestana === "procedimiento" && (
          <div>
            {pasos.length > 0 ? (
              pasos.map((paso, index) => (
                <div
                  key={paso.id || index}
                  style={{
                    background: "#151a21",
                    border: "1px solid #252d38",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "#00d9ff",
                      fontSize: "13px",
                      fontWeight: "800",
                      marginBottom: "9px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {paso.titulo || "Preparación"}
                  </div>

                  <div
                    style={{
                      color: "#d7dfe7",
                      fontSize: "16px",
                      lineHeight: "1.65",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {paso.descripcion}
                  </div>
                </div>
              ))
            ) : receta.procedimiento ? (
              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#d7dfe7",
                  fontSize: "16px",
                  lineHeight: "1.65",
                  whiteSpace: "pre-line",
                }}
              >
                {receta.procedimiento}
              </div>
            ) : (
              <div
                style={{
                  background: "#151a21",
                  border: "1px solid #252d38",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#8f9baa",
                }}
              >
                No hay preparación registrada.
              </div>
            )}
          </div>
        )}

        {/* OBSERVACIONES */}
        {receta.observaciones && (
          <div
            style={{
              marginTop: "20px",
              background: "#151a21",
              border: "1px solid #252d38",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                color: "#7f8b99",
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Observaciones
            </div>

            <div
              style={{
                color: "#c6d0da",
                lineHeight: "1.5",
              }}
            >
              {receta.observaciones}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}