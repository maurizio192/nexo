import Produccion from "../components/recetas/Produccion";
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
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}
    >
      <div>
        <label>Código</label>

        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div>
        <label>Categoría</label>

        <input
          value={categoria}
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            background: "#f3f3f3"
          }}
        />
      </div>

      <div>
        <label>Unidad de producción</label>

        <select
          value={unidadProduccion}
          onChange={(e) => setUnidadProduccion(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
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
        </select>
      </div>

      <div>
        <label>Raciones producidas</label>

        <input
          type="number"
          value={raciones}
          onChange={(e) => setRaciones(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div>
        <label>Cantidad por ración</label>

        <input
          type="number"
          value={consumo}
          onChange={(e) => setConsumo(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div>
        <label>Unidad consumo</label>

        <select
          value={unidadConsumo}
          onChange={(e) => setUnidadConsumo(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
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