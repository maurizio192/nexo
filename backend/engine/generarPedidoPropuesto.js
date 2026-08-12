function extraerCantidadFormato(formato) {

  if (!formato) {
    return 0;
  }

  const texto = String(formato)
    .trim()
    .replace(",", ".");

  // Ejemplos:
  // "50 Uds"  -> 50
  // "3,0 Kg"  -> 3
  // "CAJA"    -> 0
  const match = texto.match(
    /(\d+(?:\.\d+)?)\s*(uds?|unidades?|kg|kilos?)/i
  );

  if (!match) {
    return 0;
  }

  return Number(match[1]);
}


function detectarUnidad(formato) {

  if (!formato) {
    return null;
  }

  const texto = String(formato)
    .trim()
    .toLowerCase();

  if (/kg|kilo/.test(texto)) {
    return "KG";
  }

  if (/uds?|unidades?/.test(texto)) {
    return "UDS";
  }

  if (/caja/.test(texto)) {
    return "CAJA";
  }

  return null;
}


function generarPedidoPropuesto(productosCriticos = []) {

  const pedidos = {};

  productosCriticos.forEach(producto => {

    const proveedor =
      producto.proveedor || "Sin proveedor asignado";


    if (!pedidos[proveedor]) {

      pedidos[proveedor] = {

        proveedor,

        dia_pedido:
          producto.dia_pedido || null,

        productos: [],

        motivo:
          "Stock crítico detectado por Sancho"

      };

    }


    const stockActual =
      Number(producto.stock_actual || 0);

    const stockMinimo =
      Number(producto.stock_minimo || 0);

    const stockGarantizado =
      Number(producto.stock_garantizado || 0);


    // ======================================
    // STOCK OBJETIVO
    // ======================================

    const stockObjetivo =
      Math.max(
        stockMinimo,
        stockGarantizado
      );


    // ======================================
    // CANTIDAD REAL NECESARIA
    // ======================================

    const cantidadNecesaria =
      Math.max(
        0,
        stockObjetivo - stockActual
      );


    if (cantidadNecesaria <= 0) {
      return;
    }


    // ======================================
    // FORMATO DE COMPRA
    // ======================================

    const formatoCompra =
      producto.formato_compra
        ? String(producto.formato_compra).trim()
        : null;


    // ======================================
    // CANTIDAD DEL FORMATO
    //
    // Primero usamos cantidad_formato.
    //
    // Si no existe, intentamos extraerla
    // del propio texto:
    //
    // "50 Uds" -> 50
    // "3,0 Kg" -> 3
    // ======================================

    let cantidadFormato =
      Number(producto.cantidad_formato || 0);


    if (
      cantidadFormato <= 0 &&
      formatoCompra
    ) {

      cantidadFormato =
        extraerCantidadFormato(
          formatoCompra
        );

    }


    // ======================================
    // UNIDAD DEL FORMATO
    // ======================================

    const unidadFormato =
      detectarUnidad(formatoCompra);


    // ======================================
    // CANTIDAD PROPUESTA
    // ======================================

    let cantidadPropuesta;

    let unidadPropuesta;


    if (cantidadFormato > 0) {

      cantidadPropuesta =
        Math.ceil(
          cantidadNecesaria /
          cantidadFormato
        );

      unidadPropuesta =
        unidadFormato || "FORMATO";

    } else {

      cantidadPropuesta =
        cantidadNecesaria;

      unidadPropuesta =
        unidadFormato || "UDS";

    }


    if (cantidadPropuesta <= 0) {
      return;
    }


    // ======================================
    // DESCRIPCIÓN PARA SANCHO
    // ======================================

    let descripcionCantidad;


    if (cantidadFormato > 0) {

      descripcionCantidad =
        `${cantidadPropuesta} ${unidadPropuesta}`;

    } else {

      descripcionCantidad =
        `${cantidadPropuesta} ${unidadPropuesta}`;

    }


    // ======================================
    // AÑADIR PRODUCTO
    // ======================================

    pedidos[proveedor].productos.push({

      producto_id:
        producto.id || null,

      nombre:
        producto.nombre,

      stock_actual:
        stockActual,

      stock_minimo:
        stockMinimo,

      stock_garantizado:
        stockGarantizado,

      stock_objetivo:
        stockObjetivo,

      cantidad_necesaria:
        cantidadNecesaria,

      cantidad_propuesta:
        cantidadPropuesta,

      formato:
        formatoCompra,

      cantidad_formato:
        cantidadFormato,

      unidad:
        unidadPropuesta,

      descripcion_cantidad:
        descripcionCantidad

    });

  });


  // ======================================
  // ELIMINAR PROVEEDORES VACÍOS
  // ======================================

  return Object.values(pedidos)
    .filter(
      pedido =>
        pedido.productos.length > 0
    );

}


module.exports =
  generarPedidoPropuesto;