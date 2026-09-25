import { useEffect, useState } from "react";
import { API } from "../../config/api";

export default function EditorIngredientes({ filas, setFilas }) {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API}/productos`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch(console.error);
  }, []);

  function agregarFila() {
    setFilas([
      ...filas,
      {
        productoId: "",
        cantidad: "",
        unidad: "g",
        merma: 0,
        descontar: true
      }
    ]);
  }

  function actualizarFila(index, campo, valor) {
    const nuevasFilas = [...filas];
    nuevasFilas[index] = {
      ...nuevasFilas[index],
      [campo]: valor
    };
    setFilas(nuevasFilas);
  }

  function eliminarFila(index) {
    setFilas(filas.filter((_, i) => i !== index));
  }

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #303945",
    background: "#11161d",
    color: "#ffffff",
    minHeight: "42px",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        background: "#151a21",
        border: "1px solid #252d38",
        borderRadius: "14px",
        padding: "18px",
        marginBottom: "25px"
      }}
    >
      <h2
        style={{
          margin: "0 0 18px",
          color: "#d7f7ff",
          fontSize: "20px"
        }}
      >
        🥕 Ingredientes
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: "720px",
            borderCollapse: "collapse",
            color: "#d7f7ff"
          }}
        >
          <thead>
            <tr>
              {["Producto", "Cantidad", "Unidad", "Merma %", "Descontar", ""].map(
                (texto, index) => (
                  <th
                    key={index}
                    style={{
                      textAlign: index === 0 ? "left" : "center",
                      padding: "10px 8px",
                      borderBottom: "1px solid #303945",
                      color: "#8f9baa",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}
                  >
                    {texto}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filas.map((fila, index) => (
              <tr key={index}>
                <td style={{ padding: "8px" }}>
                  <select
                    style={{
                      ...inputStyle,
                      width: "260px"
                    }}
                    value={fila.productoId}
                    onChange={(e) =>
                      actualizarFila(index, "productoId", e.target.value)
                    }
                  >
                    <option value="">Selecciona...</option>

                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </td>

                <td style={{ padding: "8px", textAlign: "center" }}>
                  <input
                    type="number"
                    style={{
                      ...inputStyle,
                      width: "90px"
                    }}
                    value={fila.cantidad}
                    onChange={(e) =>
                      actualizarFila(index, "cantidad", e.target.value)
                    }
                  />
                </td>

                <td style={{ padding: "8px", textAlign: "center" }}>
                  <select
                    style={inputStyle}
                    value={fila.unidad}
                    onChange={(e) =>
                      actualizarFila(index, "unidad", e.target.value)
                    }
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="ud">ud</option>
                  </select>
                </td>

                <td style={{ padding: "8px", textAlign: "center" }}>
                  <input
                    type="number"
                    style={{
                      ...inputStyle,
                      width: "75px"
                    }}
                    value={fila.merma}
                    onChange={(e) =>
                      actualizarFila(index, "merma", e.target.value)
                    }
                  />
                </td>

                <td style={{ padding: "8px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={fila.descontar}
                    onChange={(e) =>
                      actualizarFila(index, "descontar", e.target.checked)
                    }
                    style={{
                      width: "22px",
                      height: "22px"
                    }}
                  />
                </td>

                <td style={{ padding: "8px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => eliminarFila(index)}
                    style={{
                      minWidth: "42px",
                      minHeight: "42px",
                      borderRadius: "8px",
                      border: "1px solid #3b4654",
                      background: "#202732",
                      color: "#ff6b6b",
                      cursor: "pointer"
                    }}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={agregarFila}
        style={{
          marginTop: "16px",
          minHeight: "46px",
          padding: "0 18px",
          borderRadius: "10px",
          border: "1px solid #00d9ff",
          background: "#0e2229",
          color: "#00d9ff",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        ➕ Añadir ingrediente
      </button>
    </div>
  );
}
