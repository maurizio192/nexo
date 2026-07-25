import { useState } from "react";

export default function NuevaReceta() {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidadProduccion, setUnidadProduccion] = useState("");
  const [raciones, setRaciones] = useState("");
  const [consumo, setConsumo] = useState("");
  const [unidadConsumo, setUnidadConsumo] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const [emplatado, setEmplatado] = useState("");
  const [alergenos, setAlergenos] = useState("");
  const [observaciones, setObservaciones] = useState("");

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,.08)"
      }}
    >
      <h1>📖 Nueva receta</h1>

      <br />

      <input
        placeholder="Código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <br /><br />

      <input
        style={{ width: "100%" }}
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Unidad de producción"
        value={unidadProduccion}
        onChange={(e) => setUnidadProduccion(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Raciones por unidad"
        value={raciones}
        onChange={(e) => setRaciones(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Consumo por plato"
        value={consumo}
        onChange={(e) => setConsumo(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Unidad consumo"
        value={unidadConsumo}
        onChange={(e) => setUnidadConsumo(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="6"
        style={{ width: "100%" }}
        placeholder="Procedimiento"
        value={procedimiento}
        onChange={(e) => setProcedimiento(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="4"
        style={{ width: "100%" }}
        placeholder="Presentación"
        value={emplatado}
        onChange={(e) => setEmplatado(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="3"
        style={{ width: "100%" }}
        placeholder="Alérgenos"
        value={alergenos}
        onChange={(e) => setAlergenos(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="4"
        style={{ width: "100%" }}
        placeholder="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
      />

      <br /><br />

      <button
        style={{
          padding: "14px 30px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        💾 Guardar receta
      </button>
    </div>
  );
}