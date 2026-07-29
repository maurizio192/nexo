const express = require("express");

module.exports = (pool) => {

  const router = express.Router();


  // ==========================
  // LISTAR PROVEEDORES
  // ==========================

  router.get("/", async (req, res) => {

    try {

      const resultado = await pool.query(
        `
        SELECT *
        FROM proveedores
        ORDER BY nombre
        `
      );

      res.json(resultado.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  // ==========================
  // CREAR PROVEEDOR
  // ==========================

  router.post("/", async (req, res) => {

    const {
      nombre,
      contacto,
      telefono,
      email
    } = req.body;

    try {

      const resultado = await pool.query(
        `
        INSERT INTO proveedores
        (
          nombre,
          contacto,
          telefono,
          email
        )
        VALUES
        ($1,$2,$3,$4)
        RETURNING *
        `,
        [
          nombre,
          contacto,
          telefono,
          email
        ]
      );

  // ==========================
  // PRODUCTOS DE UN PROVEEDOR
  // ==========================

  router.get("/:nombre/productos", async (req, res) => {

    try {

      const { nombre } = req.params;

      const resultado = await pool.query(
        `
        SELECT *
        FROM productos
        WHERE proveedor = $1
        ORDER BY nombre
        `,
        [nombre]
      );

      res.json(resultado.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

// ==========================
// MODIFICAR PROVEEDOR
// ==========================

router.put("/:id", async (req, res) => {

  const { id } = req.params;

  const {
    nombre,
    contacto,
    telefono,
    email
  } = req.body;

  try {

    const resultado = await pool.query(
      `
      UPDATE proveedores
      SET
        nombre = $1,
        contacto = $2,
        telefono = $3,
        email = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        nombre,
        contacto,
        telefono,
        email,
        id
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
// ELIMINAR PROVEEDOR
// ==========================

router.delete("/:id", async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "DELETE FROM proveedores WHERE id = $1",
      [id]
    );

    res.json({
      ok: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      error: err.message
    });

  }

});

      res.json(resultado.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });
  return router;

};
