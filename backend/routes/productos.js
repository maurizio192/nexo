const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  // ==========================
  // LISTAR PRODUCTOS
  // ==========================

router.get("/", async (req, res) => {

  try {

    const { categoria } = req.query;

    let sql = `
      SELECT
        p.*,
        c.nombre AS categoria_nombre,
        u.nombre AS ubicacion_nombre,
        pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN categorias_productos c
      ON p.categoria_id = c.id
      LEFT JOIN ubicaciones u
      ON p.ubicacion_id = u.id
    LEFT JOIN productos_proveedores pp
ON pp.producto_id = p.id

LEFT JOIN proveedores pr
ON pr.id = pp.proveedor_id
    `;

    let valores = [];

    if (categoria) {

      sql += `
      WHERE c.nombre = $1
      `;

      valores.push(categoria);

    }

    sql += `
    ORDER BY p.nombre
    `;

    const result = await pool.query(sql, valores);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});


  // ==========================
  // CREAR PRODUCTO
  // ==========================

  router.post("/", async (req, res) => {

    try {


  const {
  nombre,
  unidad,
  categoria_id,
  proveedor_id,
  stock_actual,
  stockMinimo,
  stockGarantizado,
  ubicacion_id
} = req.body;


       console.log("STOCK MINIMO RECIBIDO:", stockMinimo);

       console.log("BODY RECIBIDO:", req.body);

       const resultado = await pool.query(
         `
         INSERT INTO productos
         (
           nombre,
           unidad,
           categoria_id,
           proveedor_id,
           stock_actual,
           stock_minimo,
           stock_garantizado,
           ubicacion_id
         )
         VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *
         `,
         [
           nombre,
           unidad,
           Number(categoria_id),
           proveedor_id ? Number(proveedor_id) : null,
           Number(stock_actual) || 0,
           Number(stockMinimo) || 0,
           Number(stockGarantizado) || 0,
           ubicacion_id ? Number(ubicacion_id) : null
         ]
       );

       const producto = resultado.rows[0];

// Guardar proveedor principal
if (proveedor_id) {

  await pool.query(
    `
    INSERT INTO productos_proveedores
    (
      producto_id,
      proveedor_id
    )
    VALUES ($1,$2)
    ON CONFLICT (producto_id)
    DO UPDATE
    SET proveedor_id = EXCLUDED.proveedor_id
    `,
    [
      producto.id,
      Number(proveedor_id)
    ]
  );

}

res.json(producto);


    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });
// ==========================
// MODIFICAR PRODUCTO
// ==========================

router.put("/:id", async (req, res) => {

  const { id } = req.params;

  const {
  nombre,
  unidad,
  categoria_id,
  proveedor_id,
  stock_actual,
  stockMinimo,
  stockGarantizado,
  ubicacion_id
} = req.body;

console.log("PUT PRODUCTO PARAMS:", {
  id,
  nombre,
  unidad,
  categoria_id,
  proveedor_id,
  stock_actual,
  stockMinimo,
  stockGarantizado,
  ubicacion_id
});


  try {

 const result = await pool.query(
  `
  UPDATE productos
  SET
    nombre=$1,
    unidad=$2,
    categoria_id=$3,
    stock_actual=$4,
    stock_minimo=$5,
    stock_garantizado=$6,
    ubicacion_id=$7
  WHERE id=$8
  RETURNING *
  `,
  [
    nombre,
    unidad,
    Number(categoria_id),
    Number(stock_actual),
    Number(stockMinimo),
    Number(stockGarantizado),
    Number(ubicacion_id),
    Number(id)
  ]
);

// Guardar proveedor principal
if (proveedor_id) {

  await pool.query(
    `
    INSERT INTO productos_proveedores
    (
      producto_id,
      proveedor_id
    )
    VALUES ($1,$2)
    ON CONFLICT (producto_id)
    DO UPDATE
    SET proveedor_id = EXCLUDED.proveedor_id
    `,
    [
      Number(id),
      Number(proveedor_id)
    ]
  );

}

   console.log("FILAS ACTUALIZADAS:", result.rows.length);
console.log(result.rows[0]);
res.json(result.rows[0] || {});


  } catch(err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

// ==========================
// ELIMINAR PRODUCTO
// ==========================

router.delete("/:id", async (req, res) => {

  const { id } = req.params;


  try {

    await pool.query(
      "DELETE FROM productos WHERE id = $1",
      [id]
    );


    res.json({
      ok:true
    });


  } catch(err) {

    console.error(err);

    res.status(500).json({
      ok:false,
      error:err.message
    });

  }

});

  return router;

};
