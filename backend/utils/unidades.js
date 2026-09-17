/*
|--------------------------------------------------------------------------
| NEXO - UTILIDADES DE UNIDADES
|--------------------------------------------------------------------------
| Normalizacion y conversion de unidades, compartida por el modulo MERME.
|
| En la base real de NEXO conviven 'Uds' y 'ud' para la misma unidad, ademas
| de 'kg'/'g' y 'l'/'ml'. Por eso normalizamos por alias antes de convertir.
|
| Nota: produccionService.js mantiene por ahora su propia copia privada para
| no alterar la logica de produccion ya existente.
*/

const ALIAS_UNIDADES = {
  // Masa
  g: "g",
  gr: "g",
  grs: "g",
  gramo: "g",
  gramos: "g",

  kg: "kg",
  kgs: "kg",
  kilo: "kg",
  kilos: "kg",
  kilogramo: "kg",
  kilogramos: "kg",

  // Volumen
  ml: "ml",
  mililitro: "ml",
  mililitros: "ml",

  l: "l",
  lt: "l",
  litro: "l",
  litros: "l",

  // Unidades
  ud: "ud",
  uds: "ud",
  u: "ud",
  unidad: "ud",
  unidades: "ud",

  // Formatos (identidad, se conservan tal cual)
  caja: "caja",
  cajas: "caja",
  cubeta: "cubeta",
  cubetas: "cubeta",
  bolsa: "bolsa",
  bolsas: "bolsa",
  paquete: "paquete",
  paquetes: "paquete",
  botella: "botella",
  botellas: "botella",
  bote: "bote",
  botes: "bote",
  pieza: "pieza",
  piezas: "pieza"
};

function normalizarUnidad(unidad) {
  if (typeof unidad !== "string") {
    return null;
  }

  const limpia = unidad.trim().toLowerCase();

  if (!limpia) {
    return null;
  }

  return ALIAS_UNIDADES[limpia] || limpia;
}

/*
|--------------------------------------------------------------------------
| CONVERTIR CANTIDAD
|--------------------------------------------------------------------------
| Devuelve la cantidad convertida de unidadOrigen a unidadDestino.
| Devuelve null si las unidades no son validas o no son convertibles.
*/

function convertirCantidad(cantidad, unidadOrigen, unidadDestino) {
  const valor = Number(cantidad);
  const origen = normalizarUnidad(unidadOrigen);
  const destino = normalizarUnidad(unidadDestino);

  if (!Number.isFinite(valor) || valor < 0 || !origen || !destino) {
    return null;
  }

  if (origen === destino) {
    return valor;
  }

  const conversiones = {
    "g:kg": valor / 1000,
    "kg:g": valor * 1000,
    "ml:l": valor / 1000,
    "l:ml": valor * 1000
  };

  const convertida = conversiones[`${origen}:${destino}`];

  return convertida === undefined ? null : convertida;
}

function sonConvertibles(unidadOrigen, unidadDestino) {
  const origen = normalizarUnidad(unidadOrigen);
  const destino = normalizarUnidad(unidadDestino);

  if (!origen || !destino) {
    return false;
  }

  return convertirCantidad(1, origen, destino) !== null;
}

function redondear(valor, decimales = 3) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return null;
  }

  return Number(numero.toFixed(decimales));
}

module.exports = {
  normalizarUnidad,
  convertirCantidad,
  sonConvertibles,
  redondear
};