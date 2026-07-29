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
          p.nombre,
          p.stock_actual,
          p.stock_minimo,
          p.stock_garantizado,
          (p.stock_garantizado - p.stock_actual) AS cantidad_pedir
        FROM productos p
        JOIN proveedores pr
          ON p.proveedor_id = pr.id
        WHERE p.stock_actual < p.stock_garantizado
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


    const productos = await client.query(`
      SELECT
        pr.id AS proveedor_id,
        pr.nombre AS proveedor,
        p.nombre,
        (p.stock_garantizado - p.stock_actual) AS cantidad
      FROM productos p
      JOIN proveedores pr
        ON pr.id = p.proveedor_id
      WHERE p.stock_actual < p.stock_garantizado
      ORDER BY pr.nombre, p.nombre
    `);


    const grupos = {};


    productos.rows.forEach((producto) => {

      if (!grupos[producto.proveedor_id]) {

        grupos[producto.proveedor_id] = [];

      }

      grupos[producto.proveedor_id].push(producto);

    });


    const pedidosCreados = [];


    for (const proveedor_id of Object.keys(grupos)) {


      const proveedor = grupos[proveedor_id][0].proveedor;


      // controlla se esiste già un ordine pendente
      const existente = await client.query(
        `
        SELECT id
        FROM pedidos
        WHERE proveedor_id = $1
          AND estado = 'Pendiente'
        LIMIT 1
        `,
        [
          proveedor_id
        ]
      );


      let pedidoId;


      if (existente.rows.length > 0) {

        pedidoId = existente.rows[0].id;


      } else {


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
              cantidad
            )
            VALUES
            ($1,$2,$3)
            `,
            [
              pedidoId,
              producto.nombre,
              producto.cantidad
            ]
          );


        }

      }


      pedidosCreados.push({

        id: pedidoId,
        proveedor

      });


    }


  await client.query(
  `
  INSERT INTO eventos_nexo
  (
    usuario,
    accion,
    detalle
  )
  VALUES
  ($1,$2,$3)
  `,
  [
    "Maurizio",
    "GENERAR_PEDIDOS",
    JSON.stringify(pedidosCreados)
  ]
);


await client.query("COMMIT");


res.json({
  ok: true,
  pedidos: pedidosCreados
});


    } catch (err) {

    await client.query("ROLLBACK");

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