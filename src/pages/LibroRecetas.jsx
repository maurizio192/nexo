import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";

export default function LibroRecetas() {
  const [categorias, setCategorias] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/recetas/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch(console.error);
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
              color: "#ffffff",
              fontSize: "32px",
              fontWeight: "700",
              lineHeight: "1.1",
            }}
          >
            📖 Libro de Recetas
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#8f9baa",
              fontSize: "14px",
            }}
          >
            Selecciona una categoría para consultar las recetas
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              onClick={() =>
                navigate(
                  `/categoria/${encodeURIComponent(
                    categoria.nombre
                  )}`
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
                boxShadow:
                  "0 8px 20px rgba(0,0,0,0.20)",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
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
                    color: "#ffffff",
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