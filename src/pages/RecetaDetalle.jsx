import { useParams } from "react-router-dom";
import IngredientesReceta from "../components/recetas/IngredientesReceta";
import PestanasReceta from "../components/recetas/PestanasReceta";
import ProduccionReceta from "../components/recetas/ProduccionReceta";
import { useEffect, useState } from "react";
import { API } from "../config/api";

export default function RecetaDetalle() {

  const { id } = useParams();

  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState("informacion");
const [menuAbierto, setMenuAbierto] = useState(false);


fetch(`${API}/recetas/${id}`)
  .then(res => res.json())
  .then(data => {
    console.log("DATOS API:", data);
    setDatos(data);
  })
  .catch(console.error);

  

  async function archivarReceta() {

    if (!window.confirm("¿Seguro que quieres archivar esta receta?")) return;

    try {

 const res = await fetch(
  `${API}/recetas/${id}/archivar`,
  {
    method: "PUT"
  }
);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error");
      }

      alert("✅ Receta archivada");

      window.location.href = "/recetas";

    } catch (err) {

      alert("❌ " + err.message);

    }

  }

  if (!datos) return <h2>Cargando receta...</h2>;

  const { receta, ingredientes, pasos } = datos;

  const unidades = Number(receta.unidades_producidas || 0);
  const platosPorUnidad = Number(receta.raciones_por_unidad || 0);
  const platosDisponibles = unidades * platosPorUnidad;
const estiloMenu = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "12px 18px",
  border: "none",
  background: "white",
  cursor: "pointer",
  fontSize: "15px"
};

  return (

    <div
      style={{
        padding: "20px",
        maxWidth: "1100px",
        margin: "0 auto"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >

        <div>

          <h1 style={{ margin: 0 }}>
            {receta.nombre}
          </h1>

          <h3
            style={{
              marginTop: "5px",
              color: "#666"
            }}
          >
            {receta.categoria}
          </h3>

        </div>

        <button
          onClick={archivarReceta}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🗑 Archivar receta
        </button>

      </div>

      <PestanasReceta
        pestana={pestana}
        setPestana={setPestana}
      />

      {pestana === "informacion" && (

        <>

          <h2>📋 Información</h2>

          <p><b>Código:</b> {receta.codigo}</p>
          <p><b>Estado:</b> {receta.estado}</p>
          <p><b>Categoría:</b> {receta.categoria}</p>
          <p><b>Unidad de producción:</b> {receta.unidad_produccion}</p>
          <p><b>Cantidad producida:</b> {receta.unidades_producidas || 0}</p>
          <p><b>Raciones por unidad:</b> {receta.raciones_por_unidad}</p>
          <p><b>Consumo por servicio:</b> {receta.consumo_servicio} {receta.unidad_consumo}</p>

          <hr />

        </>

      )}

            {pestana === "ingredientes" && (

        <>

          <IngredientesReceta
            ingredientes={ingredientes}
          />

          <hr />

        </>

      )}

      {pestana === "procedimiento" && (

        <>

          <h2>👨‍🍳 Procedimiento</h2>

          {pasos.map((paso) => (

            <div
              key={paso.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px"
              }}
            >

              <h3>
                {paso.orden}. {paso.titulo}
              </h3>

              <p>{paso.descripcion}</p>

            </div>

          ))}

          <hr />

        </>

      )}

{pestana === "produccion" && (

  <>

    <h2>📦 Producción</h2>

    <p>
      <b>Unidad:</b> {receta.unidad_produccion}
    </p>

    <p>
      <b>Raciones por unidad:</b> {receta.raciones_por_unidad}
    </p>

    <ProduccionReceta
      receta={receta}
    />

    <hr />

  </>

)}

{pestana === "compartir" && (

  <>

    <h2>📧 Compartir receta</h2>

    <button
      style={{
        padding:"12px 20px",
        borderRadius:"10px",
        cursor:"pointer"
      }}
      onClick={() => {

        navigator.share
        ? navigator.share({
            title: receta.nombre,
            text: `Receta NEXO: ${receta.nombre}`
          })
        : alert("Compartir no disponible en este dispositivo");

      }}
    >
      📤 Compartir
    </button>

  </>

)}

      {pestana === "observaciones" && (

        <>

          <h2>📝 Observaciones</h2>

          {receta.emplatado && (

            <>

              <h3>🍽 Presentación</h3>

              <p>{receta.emplatado}</p>

              <br />

            </>

          )}

          <p>{receta.observaciones}</p>

          <hr />

        </>

      )}

      {pestana === "alergenos" && (

        <>

          <h2>⚠️ Alérgenos</h2>

          {receta.alergenos ? (

            <div
              style={{
                background: "#fff8e1",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid #facc15"
              }}
            >

              <p style={{ whiteSpace: "pre-line" }}>
                {receta.alergenos}
              </p>

            </div>

          ) : (

            <p>No hay alérgenos registrados.</p>

          )}

        </>

      )}

    </div>

  );

}