import { useParams } from "react-router-dom";
import IngredientesReceta from "../components/recetas/IngredientesReceta";
import PestanasReceta from "../components/recetas/PestanasReceta";
import ProduccionReceta from "../components/recetas/ProduccionReceta";
import { useEffect, useState } from "react";

export default function RecetaDetalle() {

  const { id } = useParams();

  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState("informacion");

  useEffect(() => {

    fetch(`http://127.0.0.1:3001/api/recetas/${id}`)
      .then(res => res.json())
      .then(data => setDatos(data))
      .catch(console.error);

  }, [id]);

  if (!datos) return <h2>Cargando receta...</h2>;

  const { receta, ingredientes, pasos } = datos;

  const unidades = Number(receta.unidades_producidas || 0);
  const platosPorUnidad = Number(receta.raciones_por_unidad || 0);
  const platosDisponibles = unidades * platosPorUnidad;
  return (

    <div

      style={{
        padding: "20px",
        maxWidth: "1100px",
        margin: "0 auto"
      }}
    >

      <h1>{receta.nombre}</h1>


      <h3>{receta.categoria}</h3>
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
   
      {pestana === "produccion" && (
  <>
    <ProduccionReceta
      unidades={unidades}
      platosDisponibles={platosDisponibles}
      receta={receta}
    />

    <hr />
  </>
)}

    {pestana === "ingredientes" && (
  <>
    <IngredientesReceta ingredientes={ingredientes} />
    <hr />
  </>
)}
      

        
            <hr />

      

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
