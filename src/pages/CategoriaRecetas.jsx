import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../config/api";

export default function CategoriaRecetas() {
  const { categoria } = useParams();
  const navigate = useNavigate();

  const [recetas, setRecetas] = useState([]);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    fetch(API + "/recetas/categoria/" + encodeURIComponent(categoria))
      .then((res) => res.json())
      .then((data) => setRecetas(data))
      .catch(console.error);
  }, [categoria]);

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

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
          maxWidth: "900px",
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
              color: "#d7f7ff",
              fontSize: "30px",
              fontWeight: "700",
              lineHeight: "1.15",
            }}
          >
            📚 {categoria}
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#8f9baa",
              fontSize: "14px",
            }}
          >
            Recetas de esta categoría
          </p>
        </div>

        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="🔍 Buscar receta..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 15px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #303945",
            background: "#151a21",
            color: "#ffffff",
            fontSize: "16px",
            outline: "none",
          }}
        />

        {recetasFiltradas.length === 0 ? (
          <div
            style={{
              background: "#151a21",
              color: "#aeb8c4",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #252d38",
            }}
          >
            No hay recetas.
          </div>
        ) : (
          recetasFiltradas.map((receta) => (
            <div
              key={receta.id}
              onClick={() => navigate("/recetas/" + receta.id)}
              style={{
                background: "#151a21",
                color: "#d7f7ff",
                padding: "18px",
                marginBottom: "10px",
                borderRadius: "12px",
                cursor: "pointer",
                border: "1px solid #252d38",
                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                fontSize: "17px",
                fontWeight: "700",
                minHeight: "56px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
              }}
            >
              {receta.nombre}
            </div>
          ))
        )}

        <div
          onClick={() =>
            navigate(
              "/recetas/nueva?categoria=" +
                encodeURIComponent(categoria)
            )
          }
          style={{
            marginTop: "30px",
            background: "#00d9ff",
            color: "#071016",
            padding: "16px",
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            fontWeight: "800",
            fontSize: "17px",
            minHeight: "52px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ➕ Añadir receta
        </div>
      </div>
    </div>
  );
}
