import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../config/api";
import DatosBasicos from "../components/recetas/DatosBasicos";
import Produccion from "../components/recetas/Produccion";
import EditorIngredientes from "../components/recetas/EditorIngredientes";
import {
  obtenerReceta,
  actualizarReceta,
  eliminarIngredientesReceta,
  guardarIngredienteReceta
} from "../services/recetasService";



export default function EditarReceta() {
const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [listaAlergenos, setListaAlergenos] = useState([]);
  const [alergenosSeleccionados, setAlergenosSeleccionados] = useState([]);
  const [observaciones, setObservaciones] = useState("");

  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [merma, setMerma] = useState("0");

  const [productos, setProductos] = useState([]);
  const [filas, setFilas] = useState([
  {
    productoId: "",
    cantidad: "",
    unidad: "g",
    merma: 0,
    descontar: true
  }
]);



  useEffect(() => {

  obtenerReceta(id)
    .then(data => {

      console.log("DATI EDITAR:", data);

      if (!data.receta) {
        console.error("Risposta non valida:", data);
        return;
      }

      const r = data.receta;

      
      setCodigo(r.codigo || "");
      setNombre(r.nombre || "");
      setCategoria(r.categoria || "");

      setUnidadProduccion(
        r.unidad_produccion || ""
      );

      setRaciones(
        r.raciones_por_unidad || ""
      );

      setConsumo(
        r.consumo_servicio || ""
      );

      setUnidadConsumo(
        r.unidad_consumo || ""
      );

      setProcedimiento(
        r.procedimiento || ""
      );

      setPresentacion(
        r.emplatado || ""
      );

      setObservaciones(
        r.observaciones || ""
      );

      setFilas(
        data.ingredientes.map(i => ({
          productoId: i.producto_id,
          cantidad: i.cantidad,
          unidad: i.unidad,
          merma: i.merma || 0,
          descontar: i.descontar
        }))
      );

    })
    .catch(console.error);

}, [id]);

 useEffect(() => {

  fetch(`${API}/productos`)
    .then(res => res.json())
    .then(data => setProductos(data))
    .catch(console.error);


  fetch(`${API}/recetas/alergenos/lista`)
    .then(res => res.json())
    .then(data => setListaAlergenos(data))
    .catch(console.error);

}, []);


function cambiarAlergeno(id) {

  setAlergenosSeleccionados(prev =>

    prev.includes(id)

      ? prev.filter(x => x !== id)

      : [...prev, id]

  );

}


async function guardarReceta() {
  try {

    const datosReceta = {

      codigo,
      nombre,
      categoria,

      unidadProduccion,

      racionesPorUnidad: raciones === "" ? null : Number(raciones),
      consumoServicio: consumo === "" ? null : Number(consumo),
      unidadConsumo,

      procedimiento,
      emplatado: presentacion,
      observaciones,

      tiempoPreparacion: 15,
      tiempoCoccion: 8,
      temperatura: "70 °C"

    };

    const respuesta = await actualizarReceta(id, datosReceta);




await eliminarAlergenosReceta(id);



// Guardar ingredientes

await eliminarIngredientesReceta(id);

for (const fila of filas) {

  if (!fila.productoId) continue;

  const ingrediente = {
    productoId: Number(fila.productoId),
    cantidad: Number(fila.cantidad),
    unidad: fila.unidad,
    merma: Number(fila.merma),
    descontar: fila.descontar
  };

  console.log("Enviando ingrediente", ingrediente);

  const jsonIng = await guardarIngredienteReceta(
    id,
    ingrediente
  );

  console.log("Respuesta ingrediente:", jsonIng);

}
const jsonIng = await resIng.json();

console.log("Respuesta ingrediente:", jsonIng);

// Guardar alérgenos

for (const alergenoId of alergenosSeleccionados) {

  const jsonAlergeno = await guardarAlergenoReceta(
    id,
    alergenoId
  );

  console.log("Respuesta alergeno:", jsonAlergeno);

}

// Guardar procedimiento como primer paso
if (procedimiento.trim() !== "") {

  console.log("Procedimiento preparado:", procedimiento);

}

alert("✅ Receta guardada correctamente");

navigate(`/recetas/${id}`);

} catch (err) {

  console.error(err);

  alert("❌ " + err.message);

}

}


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
      />

      <Produccion
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

      <br />

        <EditorIngredientes
       filas={filas}
       setFilas={setFilas}
      />

      <textarea
        rows="8"
        style={{ width: "100%", marginBottom: "20px" }}
        placeholder="Procedimiento"
        value={procedimiento}
        onChange={(e) => setProcedimiento(e.target.value)}
      />

      <textarea
        rows="4"
        style={{ width: "100%", marginBottom: "20px" }}
        placeholder="Presentación"
        value={presentacion}
        onChange={(e) => setPresentacion(e.target.value)}
      />

     <h3>⚠️ Alérgenos</h3>

<div
  style={{
    display:"flex",
    flexWrap:"wrap",
    gap:"10px",
    marginBottom:"20px"
  }}
>

{listaAlergenos.map((a)=>(

  <button
    key={a.id}
    type="button"
    onClick={() => cambiarAlergeno(a.id)}
    style={{
      padding:"10px 15px",
      borderRadius:"12px",
      border:"1px solid #ccc",
      cursor:"pointer",
      background: alergenosSeleccionados.includes(a.id)
        ? "#facc15"
        : "#fff",
      fontWeight:"bold"
    }}
  >

    {a.icono} {a.nombre}

  </button>

))}

</div>

      <textarea
        rows="4"
        style={{ width: "100%", marginBottom: "30px" }}
        placeholder="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
      />

   <button
  onClick={guardarReceta}
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
