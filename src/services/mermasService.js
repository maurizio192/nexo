import { API } from "../config/api";

/*
|--------------------------------------------------------------------------
| NEXO - SERVICIO MERME (merma real)
|--------------------------------------------------------------------------
| Capa de acceso al API /api/mermas. No se borra fisicamente ninguna
| rilevazione: para corregir se anula (soft state) y queda en el historial.
*/

async function leerRespuesta(respuesta) {

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(data.error || "Error en el modulo de mermas");
  }

  return data;
}

export async function registrarMerma(datos) {

  const respuesta = await fetch(
    `${API}/mermas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    }
  );

  return await leerRespuesta(respuesta);
}

export async function obtenerMermas(filtros = {}) {

  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.append(clave, valor);
    }
  });

  const consulta = parametros.toString();

  const respuesta = await fetch(
    `${API}/mermas${consulta ? `?${consulta}` : ""}`
  );

  return await leerRespuesta(respuesta);
}

export async function anularMerma(id, { responsable, motivo } = {}) {

  const respuesta = await fetch(
    `${API}/mermas/${id}/anular`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ responsable, motivo })
    }
  );

  return await leerRespuesta(respuesta);
}

export async function obtenerEstadisticasMerma(filtros = {}) {

  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.append(clave, valor);
    }
  });

  const consulta = parametros.toString();

  const respuesta = await fetch(
    `${API}/mermas/estadisticas${consulta ? `?${consulta}` : ""}`
  );

  return await leerRespuesta(respuesta);
}

export async function obtenerLavoraciones(productoId) {

  const parametros = productoId
    ? `?producto_id=${encodeURIComponent(productoId)}`
    : "";

  const respuesta = await fetch(
    `${API}/mermas/lavorazioni${parametros}`
  );

  return await leerRespuesta(respuesta);
}

export async function buscarProductosMerma(texto) {

  const respuesta = await fetch(
    `${API}/mermas/productos?q=${encodeURIComponent(texto)}`
  );

  return await leerRespuesta(respuesta);
}