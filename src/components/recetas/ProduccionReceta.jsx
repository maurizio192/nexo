import { useState } from "react";
import { API } from "../../config/api";

export default function ProduccionReceta({
  unidades,
  platosDisponibles,
  receta
}) {

 const [cantidad, setCantidad] = useState(1);

async function producir() {

  const res = await fetch(
    `${API}/recetas/${receta.id}/producir`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cantidad,
        responsable: "Maurizio"
      })
    }
  );

  const data = await res.json();

  if (data.ok) {
    alert("✅ Producción registrada correctamente");
    window.location.reload();
  } else {
    alert("❌ Error al producir");
  }

}

   return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
          marginBottom: "30px"
        }}
      >

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)"
          }}
        >
          <h3>📦 Producción</h3>

          <h1>{unidades}</h1>

          <p>{receta.unidad_produccion}</p>

          <br />

          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            style={{
              width: "80px",
              padding: "8px"
            }}
          />

          <br /><br />

          <button
            onClick={producir}
            style={{
              padding: "10px 18px",
              cursor: "pointer"
            }}
          >
            ▶ PRODUCIR
          </button>

        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)"
          }}
        >
          <h3>🍽 Platos disponibles</h3>

          <h1>{platosDisponibles}</h1>

          <p>Platos</p>

        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)"
          }}
        >
          <h3>🍴 Consumo</h3>

          <h1>{receta.consumo_servicio}</h1>

          <p>{receta.unidad_consumo} / plato</p>

        </div>
      </div>

    </>

  );
}