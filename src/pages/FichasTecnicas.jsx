import { Link } from "react-router-dom";

export default function FichasTecnicas() {
  return (
    <div style={{ padding: "30px" }}>

      <h1>📑 Fichas Técnicas</h1>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "25px",
          marginTop: "25px",
          boxShadow: "0 3px 10px rgba(0,0,0,.12)"
        }}
      >

        <h2>🍗 Delicia de Pollo</h2>

        <p><strong>Código:</strong> FT-001</p>

        <p><strong>Lote:</strong> 10 kg de pechuga</p>

        <p><strong>Producción:</strong> 4 bolsas de 2,5 kg</p>

        <Link to="/ficha/delicia-pollo">

  <button
    style={{
      marginTop: "20px",
      padding: "12px 20px",
      border: "none",
      borderRadius: "8px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer"
    }}
  >
    Abrir ficha
  </button>

</Link>
        
      </div>

    </div>
  );
}