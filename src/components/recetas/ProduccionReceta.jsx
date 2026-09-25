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
        console.error(
          "Error obteniendo la elaboración de la receta:",
          error
        );
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

  const tarjeta = {
    background: "#151a21",
    color: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #252d38",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "30px"
      }}
    >
      <div style={tarjeta}>
        <h3
          style={{
            margin: "0 0 12px",
            color: "#d7f7ff",
            fontSize: "16px"
          }}
        >
          📦 Producción
        </h3>

        <h1
          style={{
            margin: "0 0 4px",
            color: "#00d9ff",
            fontSize: "32px"
          }}
        >
          {unidades}
        </h1>

        <p
          style={{
            margin: "0 0 18px",
            color: "#8f9baa"
          }}
        >
          {receta.unidad_produccion}
        </p>

        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          style={{
            width: "90px",
            minHeight: "44px",
            padding: "8px 10px",
            boxSizing: "border-box",
            background: "#0f141a",
            color: "#ffffff",
            border: "1px solid #303945",
            borderRadius: "8px",
            fontSize: "16px"
          }}
        />

        <br />
        <br />

        <button
          onClick={producir}
          disabled={cargandoElaboracion || !elaboracion}
          style={{
            minHeight: "44px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "9px",
            background:
              cargandoElaboracion || !elaboracion
                ? "#303945"
                : "#00d9ff",
            color:
              cargandoElaboracion || !elaboracion
                ? "#8f9baa"
                : "#071016",
            cursor:
              cargandoElaboracion || !elaboracion
                ? "not-allowed"
                : "pointer",
            fontWeight: "800"
          }}
        >
          {cargandoElaboracion
            ? "Cargando elaboración..."
            : "▶ PRODUCIR"}
        </button>
      </div>

      <div style={tarjeta}>
        <h3
          style={{
            margin: "0 0 12px",
            color: "#d7f7ff",
            fontSize: "16px"
          }}
        >
          🍽 Platos disponibles
        </h3>

        <h1
          style={{
            margin: "0 0 4px",
            color: "#00d9ff",
            fontSize: "32px"
          }}
        >
          {platosDisponibles}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#8f9baa"
          }}
        >
          Platos
        </p>
      </div>

      <div style={tarjeta}>
        <h3
          style={{
            margin: "0 0 12px",
            color: "#d7f7ff",
            fontSize: "16px"
          }}
        >
          🍴 Consumo
        </h3>

        <h1
          style={{
            margin: "0 0 4px",
            color: "#00d9ff",
            fontSize: "32px"
          }}
        >
          {receta.consumo_servicio}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#8f9baa"
          }}
        >
          {receta.unidad_consumo} / plato
        </p>
      </div>
    </div>
  );
}