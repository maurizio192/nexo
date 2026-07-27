import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import DatosBasicos from "../components/recetas/DatosBasicos";
import Produccion from "../components/recetas/Produccion";
import EditorIngredientes from "../components/recetas/EditorIngredientes";

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

    fetch("http://127.0.0.1:3001/api/productos")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(console.error);

  }, []);
async function guardarReceta() {

  try {

    const respuesta = await fetch(
      "http://127.0.0.1:3001/api/recetas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          codigo,
          nombre,
          categoria,

          unidadProduccion,

          racionesPorUnidad: raciones === "" ? null : Number(raciones),
          consumoServicio: consumo === "" ? null : Number(consumo),
          unidadConsumo,

          procedimiento,
          emplatado: presentacion,
          alergenos,
          observaciones,

          tiempoPreparacion: 15,
          tiempoCoccion: 8,
          temperatura: "70 °C"

        })

      }
    );

    const datos = await respuesta.json();

const recetaId = datos.receta.id;

// Guardar ingredientes

for (const fila of filas) {

  if (!fila.productoId) continue;

  await fetch(
    `http://127.0.0.1:3001/api/recetas/${recetaId}/ingredientes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        producto_id: fila.productoId,
        cantidad: Number(fila.cantidad),
        unidad: fila.unidad,
        merma: Number(fila.merma),
        descontar: fila.descontar
      })
    }
  );

}
    // Guardar ingredientes

for (const fila of filas) {

  if (!fila.productoId) continue;

  await fetch(
    `http://127.0.0.1:3001/api/recetas/${datos.id}/ingredientes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        producto_id: fila.productoId,
        cantidad: Number(fila.cantidad),
        unidad: fila.unidad,
        merma: Number(fila.merma),
        descontar: fila.descontar
      })
    }
  );

}

    if (!respuesta.ok) {
      throw new Error(datos.error || "Error al guardar");
    }

    alert("✅ Receta guardada correctamente");

    console.log(datos);

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

      <textarea
        rows="3"
        style={{ width: "100%", marginBottom: "20px" }}
        placeholder="Alérgenos"
        value={alergenos}
        onChange={(e) => setAlergenos(e.target.value)}
      />

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