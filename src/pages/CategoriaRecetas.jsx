import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CategoriaRecetas() {

  const { categoria } = useParams();
  const navigate = useNavigate();

  const [recetas, setRecetas] = useState([]);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {

    fetch(`http://127.0.0.1:3001/api/recetas/categoria/${encodeURIComponent(categoria)}`)
      .then(res => res.json())
      .then(data => setRecetas(data))
      .catch(console.error);

  }, [categoria]);

  const recetasFiltradas = recetas.filter((r) =>
    r.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  return (

    <div style={{ padding: "20px", maxWidth: "900px" }}>

      <h1>📖 {categoria}</h1>

      <br />

      <input
        type="text"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="🔍 Buscar receta..."
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px"
        }}
      />

      {recetasFiltradas.length === 0 ? (

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center"
          }}
        >
          No hay recetas.
        </div>

      ) : (

        recetasFiltradas.map((receta) => (

          <div
            key={receta.id}
            onClick={() => navigate(`/recetas/${receta.id}`)}
            style={{
              background: "white",
              padding: "18px",
              marginBottom: "10px",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              transition: ".2s"
            }}
          >
            {receta.nombre}
          </div>

        ))

      )}

    </div>

  );

}