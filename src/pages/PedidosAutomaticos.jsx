import { useEffect, useState } from "react";
import { API } from "../config/api";

function PedidosAutomaticos() {

  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {

    const res = await fetch(`${API}/pedidos`);

    const data = await res.json();

    setPedidos(data);

  }

  const proveedores = {};

  pedidos.forEach((p) => {

    if (!proveedores[p.proveedor]) {

      proveedores[p.proveedor] = [];

    }

    proveedores[p.proveedor].push(p);

  });

  return (

    <div style={{ padding: 20 }}>

      <h1>Pedidos Automáticos</h1>

      {Object.keys(proveedores).map((nombreProveedor) => (

        <div
          key={nombreProveedor}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 20,
            padding: 15,
          }}
        >

          <h2>{nombreProveedor}</h2>

          <table width="100%">

            <thead>

              <tr>

                <th align="left">Producto</th>

                <th>Stock</th>

                <th>Garantizado</th>

                <th>A pedir</th>

              </tr>

            </thead>

            <tbody>

              {proveedores[nombreProveedor].map((p) => (

                <tr key={p.nombre}>

                  <td>{p.nombre}</td>

                  <td align="center">{p.stock_actual}</td>

                  <td align="center">{p.stock_garantizado}</td>

                  <td align="center">
                    <strong>{p.cantidad_pedir}</strong>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      ))}

      <button>

        Crear pedidos

      </button>

    </div>

  );

}

export default PedidosAutomaticos;