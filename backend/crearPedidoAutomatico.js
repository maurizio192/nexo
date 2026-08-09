/**
 * NEXO - Motor automático de pedidos
 *
 * Calcula qué productos hay que pedir y los agrupa
 * por proveedor principal.
 */

function crearPedidoAutomatico(productos, opciones = {}) {
  const {
    stockObjetivoDefault = 0,
    stockMinimoDefault = 0
  } = opciones;

  if (!Array.isArray(productos)) {
    throw new Error("productos debe ser un array");
  }

  const pedidosPorProveedor = {};

  for (const producto of productos) {
    const stockActual = Number(producto.stock_actual ?? 0);

    const stockObjetivo = Number(
      producto.stock_objetivo ??
      producto.stock_minimo ??
      stockObjetivoDefault
    );

    const stockMinimo = Number(
      producto.stock_minimo ??
      stockMinimoDefault
    );

    const pedidosPendientes = Number(
      producto.pedidos_pendientes ?? 0
    );

    const proveedor =
      producto.proveedor_principal ??
      producto.proveedor ??
      null;

    if (!proveedor) {
      continue;
    }

    /*
     * Stock disponible real:
     * stock actual + pedidos que ya vienen de camino.
     */
    const stockDisponible =
      stockActual + pedidosPendientes;

    /*
     * Solo proponemos pedido cuando el stock
     * está por debajo del objetivo.
     */
    if (stockDisponible >= stockObjetivo) {
      continue;
    }

    let cantidadPedir =
      stockObjetivo - stockDisponible;

    /*
     * Nunca permitir cantidades negativas.
     */
    if (cantidadPedir <= 0) {
      continue;
    }

    /*
     * Si existe una cantidad mínima de pedido
     * del producto, respetarla.
     */
    const pedidoMinimo = Number(
      producto.pedido_minimo ?? 0
    );

    if (pedidoMinimo > 0 && cantidadPedir < pedidoMinimo) {
      cantidadPedir = pedidoMinimo;
    }

    /*
     * Agrupar por proveedor.
     */
    if (!pedidosPorProveedor[proveedor]) {
      pedidosPorProveedor[proveedor] = {
        proveedor,
        productos: []
      };
    }

    pedidosPorProveedor[proveedor].productos.push({
      producto_id: producto.id,
      producto: producto.nombre,
      codigo: producto.codigo ?? null,
      formato: producto.formato ?? null,
      stock_actual: stockActual,
      pedidos_pendientes: pedidosPendientes,
      stock_objetivo: stockObjetivo,
      stock_minimo: stockMinimo,
      cantidad_pedir: cantidadPedir
    });
  }

  /*
   * Convertimos el objeto en array para que sea
   * más fácil utilizarlo en el endpoint /api/sancho.
   */
  const pedidosPropuestos =
    Object.values(pedidosPorProveedor);

  return {
    totalProveedores: pedidosPropuestos.length,

    totalProductos: pedidosPropuestos.reduce(
      (total, pedido) =>
        total + pedido.productos.length,
      0
    ),

    pedidosPropuestos
  };
}

module.exports = {
  crearPedidoAutomatico
};