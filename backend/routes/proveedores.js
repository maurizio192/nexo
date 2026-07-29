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
