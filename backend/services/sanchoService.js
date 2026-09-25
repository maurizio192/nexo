require("dotenv").config();

const API = process.env.API_BASE_URL || "http://localhost:3001/api";

export async function obtenerEstadoSancho() {

  const res = await fetch(`${API}/sancho`);

  if (!res.ok) {
    throw new Error("No se pudo obtener el estado de Sancho");
  }

  return await res.json();

}

export async function generarPedido(proveedor = "Makro") {

  const res = await fetch(`${API}/pedidos/generar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      proveedor
    })
  });

  if (!res.ok) {
    throw new Error("No se pudo generar el pedido");
  }

  return await res.json();

}

export { API };