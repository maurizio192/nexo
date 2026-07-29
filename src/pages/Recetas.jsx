import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
export default function Recetas() {

  const [recetas, setRecetas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    fetch(`${API}/recetas`)
      .then(res => res.json())
      .then(data => setRecetas(data))
      .catch(err => console.error(err));

  }, []);

  return (

    <div style={{ padding: "20px" }}>

      <h1>📖 Recetas</h1>

      {recetas.map((receta) => (

        <div
          key={receta.id}
          onClick={() => navigate(`/recetas/${receta.id}`)}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
        >

          <strong>{receta.nombre}</strong>

          <br />

          <small>{receta.categoria}</small>

        </div>

      ))}

    </div>

  );

}