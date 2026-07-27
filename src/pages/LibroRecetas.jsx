import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LibroRecetas() {

  const [categorias, setCategorias] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

  fetch("http://127.0.0.1:3001/api/recetas/categorias")
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
          key={categoria.id}
          onClick={() =>
            navigate(`/categoria/${encodeURIComponent(categoria.nombre)}`)
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px"
            }}
          >

            <span style={{ fontSize: "30px" }}>
              {categoria.icono}
            </span>

            <h2 style={{ margin: 0 }}>
              {categoria.nombre}
            </h2>

          </div>

          <span>▶</span>

        </div>

      ))}

    </div>

  );

}