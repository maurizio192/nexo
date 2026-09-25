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
  guardarIngredienteReceta,
  eliminarAlergenosReceta,
  guardarAlergenoReceta
} from "../services/recetasService";

export default function EditarReceta() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoriaInicial = searchParams.get("categoria") || "";

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
      .then((data) => {
        console.log("DATOS EDITAR:", data);

        if (!data.receta) {
          console.error("Respuesta no válida:", data);
          return;
        }

        const r = data.receta;

        setCodigo(r.codigo || "");
        setNombre(r.nombre || "");
        setCategoria(r.categoria || "");
        setUnidadProduccion(r.unidad_produccion || "");
        setRaciones(r.raciones_por_unidad || "");
        setConsumo(r.consumo_servicio || "");
        setUnidadConsumo(r.unidad_consumo || "");
        setProcedimiento(r.procedimiento || "");
        setPresentacion(r.emplatado || "");
        setObservaciones(r.observaciones || "");

        setFilas(
          (data.ingredientes || []).map((i) => ({
            productoId: i.producto_id,
            cantidad: i.cantidad,
            unidad: i.unidad,
            merma: i.merma || 0,
            descontar: i.descontar
          }))
        );

        setAlergenosSeleccionados(
          (data.alergenos || []).map((a) => a.id)
        );
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    fetch(`${API}/recetas/alergenos/lista`)
      .then((res) => res.json())
      .then((data) => setListaAlergenos(data))
      .catch(console.error);
  }, []);

  function cambiarAlergeno(alergenoId) {
    setAlergenosSeleccionados((prev) =>
      prev.includes(alergenoId)
        ? prev.filter((x) => x !== alergenoId)
        : [...prev, alergenoId]
    );
  }

  async function guardarReceta() {
    try {
      const datosReceta = {
        codigo,
        nombre,
        categoria,
        unidadProduccion,
        racionesPorUnidad:
          raciones === "" ? null : Number(raciones),
        consumoServicio:
          consumo === "" ? null : Number(consumo),
        unidadConsumo,
        procedimiento,
        emplatado: presentacion,
        observaciones,
        tiempoPreparacion: 15,
        tiempoCoccion: 8,
        temperatura: "70 °C"
      };

      /*
       * El PUT guarda también el procedimiento y sincroniza
       * receta_pasos. No hacemos POST /pasos aquí para evitar
       * duplicados.
       */
      await actualizarReceta(id, datosReceta);

      await eliminarAlergenosReceta(id);
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

        console.log("Enviando ingrediente:", ingrediente);

        await guardarIngredienteReceta(id, ingrediente);
      }

      for (const alergenoId of alergenosSeleccionados) {
        await guardarAlergenoReceta(id, alergenoId);
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
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background: "#0b0f14",
        color: "#ffffff",
        padding: "24px"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#11161d",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #252d38",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              color: "#00d9ff",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: "6px"
            }}
          >
            NEXO · COCINA
          </div>

          <h1
            style={{
              margin: 0,
              color: "#d7f7ff",
              fontSize: "28px",
              lineHeight: "1.15"
            }}
          >
            ✏️ Modificar receta
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#8f9baa",
              fontSize: "14px"
            }}
          >
            Modifica los datos y guarda los cambios.
          </p>
        </div>

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

        <EditorIngredientes
          filas={filas}
          setFilas={setFilas}
        />

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px"
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              color: "#d7f7ff",
              fontSize: "20px"
            }}
          >
            👨‍🍳 Procedimiento
          </h2>

          <textarea
            rows="8"
            value={procedimiento}
            onChange={(e) => setProcedimiento(e.target.value)}
            placeholder="Describe el procedimiento..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #303945",
              background: "#11161d",
              color: "#ffffff",
              fontSize: "16px",
              lineHeight: "1.5",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px"
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              color: "#d7f7ff",
              fontSize: "20px"
            }}
          >
            🍽️ Presentación
          </h2>

          <textarea
            rows="4"
            value={presentacion}
            onChange={(e) => setPresentacion(e.target.value)}
            placeholder="Describe la presentación..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #303945",
              background: "#11161d",
              color: "#ffffff",
              fontSize: "16px",
              lineHeight: "1.5",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px"
          }}
        >
          <h2
            style={{
              margin: "0 0 14px",
              color: "#d7f7ff",
              fontSize: "20px"
            }}
          >
            ⚠️ Alérgenos
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            {listaAlergenos.map((a) => {
              const seleccionado = alergenosSeleccionados.includes(a.id);

              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => cambiarAlergeno(a.id)}
                  style={{
                    minHeight: "44px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: seleccionado
                      ? "1px solid #00d9ff"
                      : "1px solid #303945",
                    background: seleccionado
                      ? "#0e333d"
                      : "#11161d",
                    color: seleccionado
                      ? "#00d9ff"
                      : "#d7dfe8",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px"
                  }}
                >
                  {a.icono} {a.nombre}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "#151a21",
            border: "1px solid #252d38",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px"
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
              color: "#d7f7ff",
              fontSize: "20px"
            }}
          >
            📝 Observaciones
          </h2>

          <textarea
            rows="4"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #303945",
              background: "#11161d",
              color: "#ffffff",
              fontSize: "16px",
              lineHeight: "1.5",
              resize: "vertical",
              outline: "none"
            }}
          />
        </div>

        <button
          type="button"
          onClick={guardarReceta}
          style={{
            width: "100%",
            minHeight: "52px",
            padding: "14px",
            background: "#00d9ff",
            color: "#071016",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "800",
            cursor: "pointer"
          }}
        >
          💾 Guardar receta
        </button>
      </div>
    </div>
  );
}
