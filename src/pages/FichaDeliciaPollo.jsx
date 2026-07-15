export default function FichaDeliciaPollo() {

  return (

    <div style={{ padding: "30px" }}>

      <h1>🍗 Delicia de Pollo</h1>

      <hr />

      <h2>Información General</h2>

      <p><b>Código:</b> FT-001</p>

      <p><b>Versión:</b> 1.0</p>

      <p><b>Lote:</b> 10 kg pechuga</p>

      <p><b>Rendimiento:</b> 4 bolsas de 2,5 kg</p>

      <hr />

      <h2>Ingredientes</h2>

      <ul>

        <li>10 kg Pechuga</li>
        <li>8 kg Cebolla</li>
        <li>12 kg Zanahoria</li>
        <li>100 g Bovril</li>
        <li>2 l Nata</li>
        <li>2,5 l Vino Moscatel</li>

      </ul>

      <hr />

      <h2>Producción</h2>

      <button
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "15px 25px",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "18px"
        }}
      >
        👨‍🍳 Producir lote
      </button>

    </div>

  );

}