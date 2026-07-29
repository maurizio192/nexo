const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  // ==========================
  // LISTAR PRODUCTOS
  // ==========================

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(`
        SELECT *
        FROM productos
        ORDER BY nombre
      `);

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
        stockMinimo,
        ubicacion,
        categoria,
        proveedor
      } = req.body;

       console.log("STOCK MINIMO RECIBIDO:", stockMinimo);


      const resultado = await pool.query(
        `
        INSERT INTO productos
        (
          nombre,
          unidad,
          categoria,
          proveedor,
          stock_actual,
          stock_minimo,
          ubicacion,
          precio
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
          nombre,
          unidad,
          categoria,
          proveedor,
          0,
          Number(stockMinimo) || 0,
          ubicacion,
          0
        ]
      );


      res.json(resultado.rows[0]);


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
    categoria,
    proveedor,
    stockMinimo,
    ubicacion
  } = req.body;


  try {

    const result = await pool.query(
      `
      UPDATE productos
      SET
        nombre=$1,
        unidad=$2,
        categoria=$3,
        proveedor=$4,
        stock_minimo=$5,
        ubicacion=$6
      WHERE id=$7
      RETURNING *
      `,
      [
        nombre,
        unidad,
        categoria,
        proveedor,
        Number(stockMinimo),
        ubicacion,
        id
      ]
    );


    res.json(result.rows[0]);


  } catch (err) {

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