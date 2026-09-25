export default function Produccion({
  codigo,
  setCodigo,
  categoria,
  unidadProduccion,
  setUnidadProduccion,
  raciones,
  setRaciones,
  consumo,
  setConsumo,
  unidadConsumo,
  setUnidadConsumo
}) {
  const campo = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #303945",
    background: "#11161d",
    color: "#ffffff",
    outline: "none",
    fontSize: "16px",
    minHeight: "46px"
  };

  const etiqueta = {
    display: "block",
    marginBottom: "7px",
    color: "#8f9baa",
    fontSize: "13px",
    fontWeight: "700"
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}
    >
      <div>
        <label style={etiqueta}>Código</label>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={campo}
        />
      </div>

      <div>
        <label style={etiqueta}>Categoría</label>
        <input
          value={categoria}
          readOnly
          style={{
            ...campo,
            background: "#181e27",
            color: "#aeb8c4"
          }}
        />
      </div>

      <div>
        <label style={etiqueta}>Unidad de producción</label>
        <select
          value={unidadProduccion}
          onChange={(e) => setUnidadProduccion(e.target.value)}
          style={campo}
        >
          <option value="">Selecciona...</option>
          <option>🥩 Bolsa al vacío</option>
          <option>🍽️ Cubeta Gastronorm</option>
          <option>📦 Caja</option>
          <option>🫙 Tarro</option>
          <option>🥫 Lata</option>
          <option>🧴 Biberón</option>
          <option>📍 Unidad</option>
          <option>⚖️ Kilogramo</option>
          <option>⚖️ Gramo</option>
          <option>🥛 Litro</option>
          <option>🎂 Manga pastelera</option>
          <option>🍰 Bandeja</option>
          <option>🧁 Molde</option>
        </select>
      </div>

      <div>
        <label style={etiqueta}>Raciones producidas</label>
        <input
          type="number"
          value={raciones}
          onChange={(e) => setRaciones(e.target.value)}
          style={campo}
        />
      </div>

      <div>
        <label style={etiqueta}>Cantidad por ración</label>
        <input
          type="number"
          value={consumo}
          onChange={(e) => setConsumo(e.target.value)}
          style={campo}
        />
      </div>

      <div>
        <label style={etiqueta}>Unidad consumo</label>
        <select
          value={unidadConsumo}
          onChange={(e) => setUnidadConsumo(e.target.value)}
          style={campo}
        >
          <option value="">Selecciona...</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="unidad">Unidad</option>
          <option value="porción">Porción</option>
        </select>
      </div>
    </div>
  );
}
