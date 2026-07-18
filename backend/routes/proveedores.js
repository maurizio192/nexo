const express = require("express");
const router = express.Router();

module.exports = (pool) => {

  router.get("/", async (req, res) => {
    try {
      const resultado = await pool.query(
        "SELECT * FROM proveedores ORDER BY nombre"
      );

      res.json(resultado.rows);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Errore database"
      });
    }
  });

  router.post("/", async (req, res) => {

    const {
      nombre,
      contacto,
      telefono,
      email
    } = req.body;

    try {

      const resultado = await pool.query(

        `INSERT INTO proveedores
        (nombre, contacto, telefono, email)
        VALUES ($1,$2,$3,$4)
        RETURNING *`,

        [nombre, contacto, telefono, email]

      );

      res.json(resultado.rows[0]);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Errore database"
      });

    }

  });
  router.get("/:nombre/productos", async (req, res) => {

    try {

      const { nombre } = req.params;

      const resultado = await pool.query(

        `SELECT *
         FROM productos
         WHERE proveedor = $1
         ORDER BY nombre`,

        [nombre]

      );

      res.json(resultado.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Errore database"
      });

    }

  });
  return router;
};