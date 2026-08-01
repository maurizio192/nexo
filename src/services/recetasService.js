import { API } from "../config/api";


export async function obtenerReceta(id) {

  const respuesta = await fetch(
    `${API}/recetas/${id}`
  );

  if (!respuesta.ok) {
    throw new Error("Errore caricamento ricetta");
  }

  return await respuesta.json();
}



export async function actualizarReceta(id, datos) {

  const respuesta = await fetch(
    `${API}/recetas/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    }
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error || "Errore aggiornamento ricetta"
    );
  }

  return data;
}



export async function eliminarIngredientesReceta(id) {

  const respuesta = await fetch(
    `${API}/recetas/${id}/ingredientes`,
    {
      method: "DELETE"
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      "Errore eliminazione ingredienti"
    );
  }

  return await respuesta.json();
}



export async function guardarIngredienteReceta(id, ingrediente) {

  const respuesta = await fetch(
    `${API}/recetas/${id}/ingredientes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ingrediente)
    }
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error || "Errore salvataggio ingrediente"
    );
  }

  return data;
}



export async function eliminarAlergenosReceta(id) {

  const respuesta = await fetch(
    `${API}/recetas/${id}/alergenos`,
    {
      method: "DELETE"
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      "Errore eliminazione allergeni"
    );
  }

  return await respuesta.json();
}



export async function guardarAlergenoReceta(id, alergenoId) {

  const respuesta = await fetch(
    `${API}/recetas/${id}/alergenos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        alergeno_id: alergenoId
      })
    }
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error || "Errore salvataggio allergene"
    );
  }

  return data;
}