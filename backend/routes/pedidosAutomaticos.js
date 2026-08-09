const express = require("express");

module.exports = (pool) => {
  const router = express.Router();

// ======================================
// PROGRAMAR CANTIDAD PARA PRÓXIMO PEDIDO
// ======================================

router.post("/programar", async (req, res) => {
  try {
    const {
      producto_id,
      cantidad,
      formato
    } = req.body;

    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({
        error: "producto_id y cantidad son obligatorios"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE productos
      SET
        pedido_proximo_cantidad = $1,
        pedido_proximo_formato = $2
      WHERE id = $3
      RETURNING
        id,
        nombre,
        pedido_proximo_cantidad,
        pedido_proximo_formato
      `,
      [
        cantidad,
        formato || null,
        producto_id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    console.log(
      "===== PRÓXIMO PEDIDO PROGRAMADO ====="
    );
    console.log(resultado.rows[0]);

    res.json({
      ok: true,
      producto: resultado.rows[0]
    });

  } catch (err) {
    console.error(
      "ERROR PROGRAMANDO PRÓXIMO PEDIDO:"
    );
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});


  // ======================================
  // PEDIDOS AUTOMÁTICOS
  // ======================================


router.post("/", async (req, res) => {
  try {

    const resultado = await pool.query(`
      SELECT
        p.id AS producto_id,
        p.nombre,
        p.stock_actual,
        p.stock_minimo,

        -- Cantidad automática
        (p.stock_minimo - p.stock_actual) AS cantidad_automatica,

        -- Programación manual para el próximo pedido
        p.pedido_proximo_cantidad,
        p.pedido_proximo_formato,

        -- Formato habitual de compra
        p.formato_compra,
        p.cantidad_formato,

        pr.id AS proveedor_id,
        pr.nombre AS proveedor

      FROM productos p

      JOIN proveedores pr
        ON p.proveedor_id = pr.id

      WHERE
        p.stock_actual < p.stock_minimo
        OR p.pedido_proximo_cantidad IS NOT NULL

      ORDER BY pr.nombre, p.nombre
    `);

    const pedidos = {};

    for (const producto of resultado.rows) {

      const proveedorId = producto.proveedor_id;

      if (!pedidos[proveedorId]) {

        pedidos[proveedorId] = {
          proveedor_id: proveedorId,
          proveedor: producto.proveedor,
          estado: "BORRADOR",
          origen: "AUTOMÁTICO",
          productos: []
        };
      }

      // ==========================================
      // PRIORIDAD:
      // 1. CANTIDAD PROGRAMADA
      // 2. CÁLCULO AUTOMÁTICO
      // ==========================================

      const tieneProgramacion =
        producto.pedido_proximo_cantidad !== null &&
        Number(producto.pedido_proximo_cantidad) > 0;

      const cantidad = tieneProgramacion
        ? Number(producto.pedido_proximo_cantidad)
        : Number(producto.cantidad_automatica);

      const formato = tieneProgramacion
        ? producto.pedido_proximo_formato
        : producto.formato_compra;

      pedidos[proveedorId].productos.push({

        producto_id: producto.producto_id,

        nombre: producto.nombre,

        stock_actual: Number(producto.stock_actual),

        stock_minimo: Number(producto.stock_minimo),

        cantidad: cantidad,

        formato: formato || null,

        cantidad_formato:
          producto.cantidad_formato !== null
            ? Number(producto.cantidad_formato)
            : null,

        origen: tieneProgramacion
          ? "PROGRAMADO"
          : "AUTOMÁTICO"

      });
    }

    const respuesta = Object.values(pedidos);

    console.log(
      "===== BORRADORES DE PEDIDOS ====="
    );

    console.dir(respuesta, { depth: null });

    res.json(respuesta);

  } catch (err) {

    console.error(
      "ERROR PEDIDOS AUTOMÁTICOS:"
    );

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

  return router;
};