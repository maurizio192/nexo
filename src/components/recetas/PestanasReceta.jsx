export default function PestanasReceta({ pestana, setPestana }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "25px",
        flexWrap: "wrap"
      }}
    >
      <button onClick={() => setPestana("informacion")}>📄 Información</button>

      <button onClick={() => setPestana("ingredientes")}>🥕 Ingredientes</button>

      <button onClick={() => setPestana("procedimiento")}>👨‍🍳 Procedimiento</button>

      <button onClick={() => setPestana("produccion")}>📦 Producción</button>

      <button onClick={() => setPestana("alergenos")}>⚠️ Alérgenos</button>

      <button onClick={() => setPestana("observaciones")}>📝 Observaciones</button>

      <button onClick={() => setPestana("compartir")}>📧 Compartir</button>

    </div>
  );
}