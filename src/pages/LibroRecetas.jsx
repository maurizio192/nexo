import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LibroRecetas() {

  const [categorias, setCategorias] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

   fetch("http://127.0.0.1:3001/api/recetas/categorias/lista")
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(console.error);

  }, []);

  return (

    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto"
      }}
    >

      <h1 style={{ marginBottom: "30px" }}>
        📖 Libro de Recetas
      </h1>

  {categorias.map((categoria) => (

  <div
    key={categoria.categoria}
    onClick={() =>
      navigate(`/categoria/${encodeURIComponent(categoria.categoria)}`)
    }
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "white",
      padding: "18px 22px",
      marginBottom: "12px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      cursor: "pointer"
    }}
  >

    <h2 style={{ margin: 0 }}>
      {categoria.categoria}
    </h2>

    <span>
      {categoria.total} recetas ▶
    </span>

  </div>

))}


      <div
        onClick={() => navigate("/recetas/nueva")}
        style={{
          marginTop: "35px",
          background: "#0ea5e9",
          color: "white",
          padding: "18px",
          borderRadius: "12px",
          textAlign: "center",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >

        ➕ Nueva receta

      </div>

    </div>

  );

}