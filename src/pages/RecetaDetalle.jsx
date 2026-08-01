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

async function eliminarReceta() {

  if (
    !window.confirm(
      "⚠️ Esta acción eliminará definitivamente la receta.\n\n¿Continuar?"
    )
  ) return;

  try {

    const res = await fetch(
      `${API}/recetas/${id}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error");
    }

    alert("✅ Receta eliminada");

    window.location.href = "/recetas";

  } catch (err) {

    alert("❌ " + err.message);

  }

}
  if (!datos) return <h2>Cargando receta...</h2>;
  const { receta, ingredientes, pasos, alergenos } = datos;

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
      padding:"20px",
      maxWidth:"1100px",
      margin:"0 auto"
    }}
  >

    <div
      style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:"25px"
      }}
    >

      <div>

        <h1
  style={{
    margin:0,
    fontSize:"24px",
    lineHeight:"1.2",
    fontWeight:"700"
  }}
>
  {receta.nombre}
</h1>

        <div
  style={{
    color:"#666",
    marginTop:"6px",
    fontSize:"14px"
  }}
>
  {receta.categoria}
</div>

      </div>

      <div
        style={{
          display:"flex",
          gap:"10px"
        }}
      >

        <button
          onClick={archivarReceta}
          style={{
            background:"#f59e0b",
            color:"#fff",
            border:"none",
            padding:"12px 18px",
            borderRadius:"10px",
            cursor:"pointer",
            fontWeight:"bold"
          }}
        >
          📁 Archivar
        </button>

        <button
  onClick={() => {
    window.location.href = `/editar-receta/${id}`;
  }}
>
  ✏️ Editar receta
</button>

        <button
          onClick={eliminarReceta}
          style={{
            background:"#dc2626",
            color:"#fff",
            border:"none",
            padding:"12px 18px",
            borderRadius:"10px",
            cursor:"pointer",
            fontWeight:"bold"
          }}
        >
          🗑 Eliminar
        </button>

      </div>

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
    <p>
      <b>Consumo por servicio:</b> {receta.consumo_servicio} {receta.unidad_consumo}
    </p>

    <hr />

  </>

)}


{pestana === "ingredientes" && (

  <>

    <IngredientesReceta
      ingredientes={ingredientes || []}
    />

    <hr />

  </>

)}


{pestana === "procedimiento" && (

  <>

    <h2>👨‍🍳 Procedimiento</h2>

    {pasos && pasos.length > 0 ? (

      pasos.map((paso) => (

        <div
          key={paso.id}
          style={{
            background:"#ffffff",
            border:"1px solid #e5e7eb",
            borderRadius:"10px",
            padding:"15px",
            marginBottom:"15px"
          }}
        >

         <h3
  style={{
    fontSize:"16px",
    marginBottom:"8px"
  }}
>
  {paso.orden}. {paso.titulo}
</h3>

<p
  style={{
    fontSize:"14px",
    lineHeight:"1.5",
    margin:"0",
    whiteSpace:"pre-line"
  }}
>
  {paso.descripcion}
</p>

        </div>

      ))

    ) : (

      <p>No hay procedimiento registrado.</p>

    )}

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

        if (navigator.share) {

          navigator.share({
            title: receta.nombre,
            text:`Receta NEXO: ${receta.nombre}`
          });

        } else {

          alert("Compartir no disponible en este dispositivo");

        }

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

      <h3
  style={{
    fontSize:"16px",
    marginBottom:"8px"
  }}
>
  🍽 Presentación
</h3>

<p
  style={{
    fontSize:"14px",
    lineHeight:"1.5",
    whiteSpace:"pre-line"
  }}
>
  {receta.emplatado}
</p>
      </>

    )}


    <p
  style={{
    fontSize:"14px",
    lineHeight:"1.5",
    whiteSpace:"pre-line"
  }}
>
  {receta.observaciones || "Sin observaciones"}
</p>


    <hr />

  </>

)}



{pestana === "alergenos" && (

  <>

    <h2>⚠️ Alérgenos</h2>

    {alergenos && alergenos.length > 0 ? (

      <div
        style={{
          background:"#fff8e1",
          padding:"20px",
          borderRadius:"10px",
          border:"1px solid #facc15"
        }}
      >

        {alergenos.map((a)=>(

          <div
            key={a.id}
            style={{
              fontSize:"20px",
              marginBottom:"12px"
            }}
          >

            {a.icono} {a.nombre}

          </div>

        ))}

      </div>

    ) : (

      <p>
        No hay alérgenos registrados.
      </p>

    )}

  </>

)}

    </div>

  );

}