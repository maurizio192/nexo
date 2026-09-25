export default function DatosBasicos({
  nombre,
  setNombre,
  categoria,
  setCategoria
}) {
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #303945",
    background: "#11161d",
    color: "#ffffff",
    outline: "none",
    fontSize: "16px"
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#8f9baa",
          fontSize: "13px",
          fontWeight: "700"
        }}
      >
        Nombre de la receta
      </label>

      <input
        autoFocus
        placeholder="Escribe el nombre de la receta..."
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          ...inputStyle,
          padding: "16px",
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "18px"
        }}
      />

      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: "#8f9baa",
          fontSize: "13px",
          fontWeight: "700"
        }}
      >
        Categoría
      </label>

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        style={inputStyle}
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
    </div>
  );
}
