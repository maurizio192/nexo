import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DatosBasicos from "../components/recetas/DatosBasicos";
export default function NuevaReceta() {

  const [searchParams] = useSearchParams();

  const categoriaInicial =
  searchParams.get("categoria") || "";

const [categoria, setCategoria] = useState(categoriaInicial);
const [codigo, setCodigo] = useState("");
const [nombre, setNombre] = useState("");
const [unidadProduccion, setUnidadProduccion] = useState("");
const [raciones, setRaciones] = useState("");
const [consumo, setConsumo] = useState("");
const [unidadConsumo, setUnidadConsumo] = useState("");

const [procedimiento, setProcedimiento] = useState("");
const [presentacion, setPresentacion] = useState("");
const [alergenos, setAlergenos] = useState("");
const [producto, setProducto] = useState("");
const [cantidad, setCantidad] = useState("");
const [unidad, setUnidad] = useState("g");
const [merma, setMerma] = useState("0");
const [productos, setProductos] = useState([]);
const [ingredientes, setIngredientes] = useState([]);
const [observaciones, setObservaciones] = useState("");

useEffect(() => {

  fetch("http://127.0.0.1:3001/api/productos")
    .then(res => res.json())
    .then(data => setProductos(data))
    .catch(console.error);

}, []);

return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        background: "#fff",
        padding: "35px",
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,.08)"
      }}
    >

     <DatosBasicos
  nombre={nombre}
  setNombre={setNombre}
  categoria={categoria}
  setCategoria={setCategoria}
Produccion
  codigo={codigo}
  setCodigo={setCodigo}
  categoria={categoria}
  unidadProduccion={unidadProduccion}
  setUnidadProduccion={setUnidadProduccion}
  raciones={raciones}
  setRaciones={setRaciones}
  consumo={consumo}
  setConsumo={setConsumo}
  unidadConsumo={unidadConsumo}
  setUnidadConsumo={setUnidadConsumo}
/>
      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"20px"
        }}
      >

        <div>

          <label>Código</label>

          <input
            value={codigo}
            onChange={(e)=>setCodigo(e.target.value)}
            style={{width:"100%",padding:"10px"}}
          />

        </div>

        <div>

          <label>Categoría</label>

          <input
            value={categoria}
            readOnly
            style={{
              width:"100%",
              padding:"10px",
              background:"#f3f3f3"
            }}
          />

        </div>

        <div>

          <label>Unidad de producción</label>

          <select
            value={unidadProduccion}
            onChange={(e)=>setUnidadProduccion(e.target.value)}
            style={{width:"100%",padding:"10px"}}
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

          <label>Unidad de consumo</label>

          <select
            value={unidadConsumo}
            onChange={(e)=>setUnidadConsumo(e.target.value)}
            style={{width:"100%",padding:"10px"}}
          >

            <option value="">Selecciona...</option>

            <option>g</option>
            <option>kg</option>
            <option>ml</option>
            <option>l</option>
            <option>Unidad</option>
            <option>Porción</option>

          </select>

        </div>

        <div>

          <label>Raciones que produce</label>

          <input
            type="number"
            value={raciones}
            onChange={(e)=>setRaciones(e.target.value)}
            style={{width:"100%",padding:"10px"}}
          />

        </div>

        <div>

          <label>Cantidad por ración</label>

          <input
            type="number"
            value={consumo}
            onChange={(e)=>setConsumo(e.target.value)}
            style={{width:"100%",padding:"10px"}}
          />

        </div>

      </div>

      <hr style={{margin:"35px 0"}} />

      {/* PROCEDIMIENTO */}
          <label
        style={{
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        <h2 style={{ marginTop: "40px" }}>🧂 Ingredientes</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "3fr 1fr 1fr 1fr auto",
    gap: "10px",
    marginBottom: "15px"
  }}
>

  <input
  list="lista-productos"
  placeholder="Buscar producto..."
  value={producto}
  onChange={(e) => setProducto(e.target.value)}
/>

<datalist id="lista-productos">

  {productos.map((p) => (

    <option
      key={p.id}
      value={p.nombre}
    />

  ))}

</datalist>
  <input
    type="number"
    placeholder="Cantidad"
    value={cantidad}
    onChange={(e) => setCantidad(e.target.value)}
  />

  <select
    value={unidad}
    onChange={(e) => setUnidad(e.target.value)}
  >
    <option>g</option>
    <option>kg</option>
    <option>ml</option>
    <option>l</option>
    <option>ud</option>
  </select>

  <input
    type="number"
    placeholder="%"
    value={merma}
    onChange={(e) => setMerma(e.target.value)}
  />

<button
  onClick={() => {

    if (!producto || !cantidad) return;

    setIngredientes([
      ...ingredientes,
      {
        producto,
        cantidad,
        unidad,
        merma
      }
    ]);

    setProducto("");
    setCantidad("");
    setUnidad("g");
    setMerma("0");

  }}
>
  ➕
</button>
{ingredientes.map((i, index) => (

  <div
    key={index}
    style={{
      display: "grid",
      gridTemplateColumns: "3fr 1fr 1fr 1fr auto",
      gap: "10px",
      padding: "8px 0",
      borderBottom: "1px solid #eee"
    }}
  >

    <div>{i.producto}</div>
    <div>{i.cantidad}</div>
    <div>{i.unidad}</div>
    <div>{i.merma}%</div>

   <button
  onClick={() =>
    setIngredientes(
      ingredientes.filter((_, i) => i !== index)
    )
  }
>
  🗑️
</button>

  </div>

))}
</div>
        👨‍🍳 Procedimiento
      </label>

      <textarea
        rows={8}
        value={procedimiento}
        onChange={(e) => setProcedimiento(e.target.value)}
        style={{
          width: "100%",
          marginTop: "8px",
          marginBottom: "30px",
          padding: "12px",
          resize: "vertical"
        }}
      />

      <label
        style={{
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        🍽️ Presentación
      </label>

      <textarea
        rows={4}
        value={presentacion}
        onChange={(e) => setPresentacion(e.target.value)}
        style={{
          width: "100%",
          marginTop: "8px",
          marginBottom: "30px",
          padding: "12px",
          resize: "vertical"
        }}
      />

      <label
        style={{
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        ⚠️ Alérgenos
      </label>

      <textarea
        rows={3}
        value={alergenos}
        onChange={(e) => setAlergenos(e.target.value)}
        style={{
          width: "100%",
          marginTop: "8px",
          marginBottom: "30px",
          padding: "12px",
          resize: "vertical"
        }}
      />

      <label
        style={{
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        📝 Observaciones
      </label>

      <textarea
        rows={4}
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        style={{
          width: "100%",
          marginTop: "8px",
          marginBottom: "35px",
          padding: "12px",
          resize: "vertical"
        }}
      />

      <button
        style={{
          width: "100%",
          padding: "16px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        
        💾 Guardar receta
      </button>

    </div>

  );

}