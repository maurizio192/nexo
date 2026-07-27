export default function DatosBasicos({
  nombre,
  setNombre,
  categoria,
  setCategoria
}) {
  return (
    <>
      <input
        autoFocus
        placeholder="Escribe el nombre de la receta..."
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          width: "100%",
          padding: "18px",
          fontSize: "28px",
          fontWeight: "bold",
          border: "none",
          borderBottom: "2px solid #ddd",
          outline: "none",
          marginBottom: "30px"
        }}
      />

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      >
        <option value="">Selecciona categoría...</option>
        <option value="Carnes">🥩 Carnes</option>
        <option value="Pescados">🐟 Pescados</option>
        <option value="Mariscos">🦑 Mariscos</option>
        <option value="Arroces">🍚 Arroces</option>
        <option value="Tapas">🥪 Tapas</option>
        <option value="Salsas">🥫 Salsas</option>
        <option value="Fondos de Cocina">🫕 Fondos de Cocina</option>
        <option value="Guarniciones">🥔 Guarniciones</option>
        <option value="Ensaladas">🥗 Ensaladas</option>
        <option value="Postres">🍰 Postres</option>
        <option value="Panadería">🥖 Panadería</option>
      </select>

      <br />
      <br />
    </>
  );
}