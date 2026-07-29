import { useEffect, useState } from "react";
import { API } from "../../config/api";
export default function EditorIngredientes({ filas, setFilas }) {

  const [productos, setProductos] = useState([]);

useEffect(() => {

  fetch(`${API}/productos`)
    .then(res => res.json())
    .then(data => setProductos(data))
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
    nuevasFilas[index][campo] = valor;
    setFilas(nuevasFilas);

  }

  function eliminarFila(index) {

    setFilas(filas.filter((_, i) => i !== index));

  }

  return (

    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "25px"
      }}
    >

      <h2>🥕 Ingredientes</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr>
            <th align="left">Producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Merma %</th>
            <th>Descontar</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {filas.map((fila, index) => (

            <tr key={index}>

              <td>

                <select
                  style={{ width: "260px" }}
                  value={fila.productoId}
                  onChange={(e) =>
                    actualizarFila(index, "productoId", e.target.value)
                  }
                >

                  <option value="">Selecciona...</option>

                  {productos.map((p) => (

                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.nombre}
                    </option>

                  ))}

                </select>

              </td>

              <td>

                <input
                  type="number"
                  style={{ width: "90px" }}
                  value={fila.cantidad}
                  onChange={(e) =>
                    actualizarFila(index, "cantidad", e.target.value)
                  }
                />

              </td>

              <td>

                <select
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

              <td>

                <input
                  type="number"
                  style={{ width: "70px" }}
                  value={fila.merma}
                  onChange={(e) =>
                    actualizarFila(index, "merma", e.target.value)
                  }
                />

              </td>

              <td align="center">

                <input
                  type="checkbox"
                  checked={fila.descontar}
                  onChange={(e) =>
                    actualizarFila(index, "descontar", e.target.checked)
                  }
                />

              </td>

              <td>

                <button
                  onClick={() => eliminarFila(index)}
                >
                  ❌
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <br />

      <button onClick={agregarFila}>
        ➕ Añadir ingrediente
      </button>

    </div>

  );

}
