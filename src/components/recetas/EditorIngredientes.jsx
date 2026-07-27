import { useState, useEffect } from "react";

export default function EditorIngredientes({
  filas,
  setFilas
}) {

  const [productos, setProductos] = useState([]);


  useEffect(() => {

    fetch("http://127.0.0.1:3001/api/productos")
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
            <th>Merma</th>
            <th>Stock</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {filas.map((fila, index) => (

            <tr key={index}>

              <td>

               <select
  style={{ width: "250px" }}
  value={fila.productoId}
  onChange={(e) => {

    const nuevasFilas = [...filas];

    nuevasFilas[index].productoId = e.target.value;

    setFilas(nuevasFilas);

  }}
>

                  <option value="">
                    Selecciona...
                  </option>

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
  style={{ width: "80px" }}
  value={fila.cantidad}
  onChange={(e) => {

    const nuevasFilas = [...filas];

    nuevasFilas[index].cantidad = e.target.value;

    setFilas(nuevasFilas);

  }}
/>
              </td>

              <td>

        <input
  style={{ width: "70px" }}
  value={fila.unidad}
  onChange={(e) => {

    const nuevasFilas = [...filas];

    nuevasFilas[index].unidad = e.target.value;

    setFilas(nuevasFilas);

  }}
/>
              </td>

              <td>

              <input
  type="number"
  style={{ width: "60px" }}
  value={fila.merma}
  onChange={(e) => {

    const nuevasFilas = [...filas];

    nuevasFilas[index].merma = e.target.value;

    setFilas(nuevasFilas);

  }}
/>
              </td>

              <td align="center">
                ✅
              </td>

              <td>

                <button>
                  ❌
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <br />

      <button
        onClick={agregarFila}
      >
        ➕ Añadir ingrediente
      </button>

    </div>

  );

}

