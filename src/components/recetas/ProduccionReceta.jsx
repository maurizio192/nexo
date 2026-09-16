import { useEffect, useState } from "react";
import { API } from "../../config/api";

export default function ProduccionReceta({
  unidades,
  platosDisponibles,
  receta
}) {

  const [cantidad, setCantidad] = useState(1);
  const [elaboracion, setElaboracion] = useState(null);
  const [cargandoElaboracion, setCargandoElaboracion] = useState(true);

  useEffect(() => {
    let activa = true;

    async function cargarElaboracion() {
      try {
        const res = await fetch(`${API}/elaboraciones/receta/${receta.id}`);
        const data = await res.json();

        if (activa && res.ok) {
          setElaboracion(data.elaboracion ?? null);
        }
      } catch (error) {
        console.error("Error obteniendo la elaboración de la receta:", error);
      } finally {
        if (activa) {
          setCargandoElaboracion(false);
        }
      }
    }

    cargarElaboracion();

    return () => {
      activa = false;
    };
  }, [receta.id]);

async function producir() {

  if (!elaboracion?.id) {
    alert("❌ Esta receta no tiene una elaboración vinculada");
    return;
  }

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    alert("❌ La cantidad debe ser mayor que cero");
    return;
  }

  try {
    const res = await fetch(
      `${API}/producciones/producir`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          elaboracionId: elaboracion.id,
          cantidad,
          responsable: "Maurizio"
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      alert("✅ Producción registrada correctamente");
      window.location.reload();
    } else {
      alert(`❌ ${data.error || "Error al producir"}`);
    }
  } catch (error) {
    console.error("Error registrando la producción:", error);
    alert("❌ No se ha podido conectar con el servidor");
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
            disabled={cargandoElaboracion || !elaboracion}
            style={{
              padding: "10px 18px",
              cursor: "pointer"
            }}
          >
            {cargandoElaboracion ? "Cargando elaboración..." : "▶ PRODUCIR"}
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
