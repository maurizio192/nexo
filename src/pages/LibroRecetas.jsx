import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

export default function LibroRecetas() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await fetch(API + "/recetas/categorias");
        const data = await respuesta.json();
        setCategorias(data);
      } catch (error) {
        console.error(error);
      }
    };

    cargarCategorias();
  }, []);

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
        <div style={{ marginBottom: "24px" }}>
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
            NEXO · COCINA
          </div>

          <h1
            style={{
              margin: 0,
              color: "#d7f7ff",
              fontSize: "32px",
              fontWeight: "700",
              lineHeight: "1.1",
            }}
          >
            📖 Libro Maestro
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#8f9baa",
              fontSize: "14px",
            }}
          >
            Recetas y elaboraciones de cocina
          </p>
        </div>

        {/* ELABORACIONES */}
        <div
          onClick={() => navigate("/elaboraciones")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            background: "#10252c",
            color: "#ffffff",
            padding: "18px",
            minHeight: "88px",
            boxSizing: "border-box",
            borderRadius: "14px",
            border: "1px solid #245563",
            boxShadow: "0 8px 20px rgba(0,0,0,0.20)",
            cursor: "pointer",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "30px",
                flexShrink: 0,
              }}
            >
              🧑‍🍳
            </span>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#d7f7ff",
                  fontSize: "18px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                }}
              >
                Elaboraciones
              </h2>

              <div
                style={{
                  marginTop: "5px",
                  color: "#8f9baa",
                  fontSize: "13px",
                }}
              >
                Bases, fondos, salsas y preparaciones
              </div>
            </div>
          </div>

          <span
            style={{
              color: "#00d9ff",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            ▶
          </span>
        </div>

        {/* SEPARADOR */}
        <div
          style={{
            color: "#647180",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            margin: "22px 0 12px",
          }}
        >
          Categorías de recetas
        </div>

        {/* CATEGORÍAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              onClick={() =>
                navigate(
                  "/categoria/" +
                    encodeURIComponent(categoria.nombre)
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "#151a21",
                color: "#ffffff",
                padding: "18px",
                minHeight: "82px",
                boxSizing: "border-box",
                borderRadius: "14px",
                border: "1px solid #252d38",
                boxShadow: "0 8px 20px rgba(0,0,0,0.20)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {categoria.icono}
                </span>

                <h2
                  style={{
                    margin: 0,
                    color: "#d7f7ff",
                    fontSize: "16px",
                    fontWeight: "700",
                    lineHeight: "1.2",
                  }}
                >
                  {categoria.nombre}
                </h2>
              </div>

              <span
                style={{
                  color: "#00d9ff",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                ▶
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
