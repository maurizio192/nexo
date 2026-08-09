const express = require("express");
const NexoEngine = require("../engine/nexoEngine");

module.exports = (pool) => {
  const router = express.Router();
  const engine = new NexoEngine(pool);

  // ======================================
  // PRODUCTOS PENDIENTES DE PEDIR
  // ======================================

  router.get("/", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          pr.id AS proveedor_id,
          pr.nombre AS proveedor,
          p.id AS producto_id,
          p.nombre,
          p.stock_actual,
          p.stock_minimo,
          (p.stock_minimo - p.stock_actual) AS cantidad_pedir
        FROM productos p
        JOIN proveedores pr
          ON p.proveedor_id = pr.id
        WHERE p.stock_actual < p.stock_minimo
        ORDER BY pr.nombre, p.nombre
      `);

      res.json(result.rows);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: err.message,
      });
    }
  });


  // ======================================
  // PEDIDOS PENDIENTES
  // ======================================

  router.get("/pendientes", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          p.id,
          p.fecha,
          p.proveedor,
          p.proveedor_id,
          p.estado,
          json_agg(
            json_build_object(
              'producto', d.producto,
              'cantidad', d.cantidad
            )
            ORDER BY d.producto
          ) AS productos
        FROM pedidos p
        JOIN pedido_detalle d
          ON p.id = d.pedido_id
        WHERE p.estado = 'Pendiente'
        GROUP BY
          p.id,
          p.fecha,
          p.proveedor,
          p.proveedor_id,
          p.estado
        ORDER BY p.id
      `);

      res.json(result.rows);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: err.message,
      });
    }
  });


  // ======================================
  // RECIBIR PEDIDO
  // ======================================

  router.post("/recibir", async (req, res) => {
    try {
      const { pedidoId } = req.body;

      await engine.ejecutar(
        "RECIBIR_PEDIDO",
        {
          pedidoId,
        }
      );

      res.json({
        ok: true,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: err.message,
      });
    }
  });


  // ======================================
  // CREAR PEDIDOS AUTOMÁTICOS
  // ======================================

  router.post("/generar", async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // ======================================
      // BUSCAR PRODUCTOS POR DEBAJO DEL MÍNIMO
      // ======================================

      const productos = await client.query(`
        SELECT
          p.id AS producto_id,
          pr.id AS proveedor_id,
          pr.nombre AS proveedor,
          p.nombre,
         p.stock_actual,
p.stock_minimo,
(p.stock_minimo - p.stock_actual) AS cantidad_automatica,
p.pedido_proximo_cantidad,
p.pedido_proximo_formato,
p.formato_compra,
p.cantidad_formato
        FROM productos p
        JOIN proveedores pr
          ON pr.id = p.proveedor_id
      WHERE
  p.stock_actual < p.stock_minimo
  OR p.pedido_proximo_cantidad IS NOT NULL
        ORDER BY pr.nombre, p.nombre
      `);


      // ======================================
      // AGRUPAR POR PROVEEDOR
      // ======================================

      const grupos = {};

      productos.rows.forEach((producto) => {
        if (!grupos[producto.proveedor_id]) {
          grupos[producto.proveedor_id] = [];
        }

       const programado =
  producto.pedido_proximo_cantidad !== null &&
  Number(producto.pedido_proximo_cantidad) > 0;

const cantidadNecesaria = programado
  ? Number(producto.pedido_proximo_cantidad)
  : Number(producto.cantidad_automatica);

const formatoPedido = programado
  ? producto.pedido_proximo_formato
  : producto.formato_compra;

const cantidadFormato =
  producto.cantidad_formato !== null
    ? Number(producto.cantidad_formato)
    : null;

let cantidadPedido = cantidadNecesaria;

if (
  formatoPedido &&
  formatoPedido.toUpperCase() !== "UDS" &&
  cantidadFormato &&
  cantidadFormato > 0
) {
  cantidadPedido = Math.ceil(
    cantidadNecesaria / cantidadFormato
  );
}

const productoPedido = {
  ...producto,

  cantidad: cantidadPedido,

  formato: formatoPedido,

  cantidad_formato: cantidadFormato,

  origen: programado
    ? "PROGRAMADO"
    : "AUTOMÁTICO"
};

grupos[producto.proveedor_id].push(productoPedido);
      });


      const pedidosCreados = [];


      // ======================================
      // CREAR UN PEDIDO POR PROVEEDOR
      // ======================================

      for (const proveedor_id of Object.keys(grupos)) {

        const proveedor = grupos[proveedor_id][0].proveedor;


        // ======================================
        // COMPROBAR SI YA EXISTE PEDIDO PENDIENTE
        // ======================================

        const existente = await client.query(
          `
          SELECT id
          FROM pedidos
          WHERE proveedor_id = $1
            AND estado = 'Pendiente'
          LIMIT 1
          `,
          [proveedor_id]
        );


        let pedidoId;


        // ======================================
        // REUTILIZAR PEDIDO EXISTENTE
        // ======================================

        if (existente.rows.length > 0) {

          pedidoId = existente.rows[0].id;

        } else {

          // ======================================
          // CREAR NUEVO PEDIDO
          // ======================================

          const pedido = await client.query(
            `
            INSERT INTO pedidos
            (
              fecha,
              proveedor,
              proveedor_id,
              estado
            )
            VALUES
            (
              CURRENT_DATE,
              $1,
              $2,
              'Pendiente'
            )
            RETURNING id
            `,
            [
              proveedor,
              proveedor_id
            ]
          );

          pedidoId = pedido.rows[0].id;
        }


        // ======================================
        // AÑADIR PRODUCTOS AL PEDIDO
        // ======================================

        for (const producto of grupos[proveedor_id]) {

          const existeProducto = await client.query(
            `
            SELECT id
            FROM pedido_detalle
            WHERE pedido_id = $1
              AND producto = $2
            LIMIT 1
            `,
            [
              pedidoId,
              producto.nombre
            ]
          );


       if (existeProducto.rows.length === 0) {

  await client.query(
    `
    INSERT INTO pedido_detalle
    (
      pedido_id,
      producto,
      cantidad,
      formato
    )
    VALUES
    ($1, $2, $3, $4)
    `,
    [
      pedidoId,
      producto.nombre,
      producto.cantidad,
      producto.formato
    ]
  );

} else if (producto.origen === "PROGRAMADO") {

  await client.query(
    `
    UPDATE pedido_detalle
    SET
      cantidad = $1,
      formato = $2
    WHERE id = $3
    `,
    [
      producto.cantidad,
      producto.formato,
      existeProducto.rows[0].id
    ]
  );
}
        }


        pedidosCreados.push({
          id: pedidoId,
          proveedor,
          proveedor_id: Number(proveedor_id),
          productos: grupos[proveedor_id].map((producto) => ({
            producto_id: producto.producto_id,
            nombre: producto.nombre,
            cantidad: Number(producto.cantidad)
          }))
        });
      }


      // ======================================
      // REGISTRAR EVENTO EN NEXO
      // ======================================

      await client.query(
        `
        INSERT INTO eventos_nexo
        (
          usuario,
          accion,
          detalle
        )
        VALUES
        ($1, $2, $3)
        `,
        [
          "Maurizio",
          "GENERAR_PEDIDOS",
          JSON.stringify(pedidosCreados)
        ]
      );


      await client.query("COMMIT");


      console.log("===== PEDIDOS AUTOMÁTICOS CREADOS =====");
      console.dir(pedidosCreados, { depth: null });


      res.json({
        ok: true,
        pedidos: pedidosCreados
      });


    } catch (err) {

      await client.query("ROLLBACK");

      console.error("ERROR GENERANDO PEDIDOS AUTOMÁTICOS:");
      console.error(err);

      res.status(500).json({
        error: err.message
      });

    } finally {

      client.release();

    }
  });


  return router;
};