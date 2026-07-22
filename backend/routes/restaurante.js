const express = require("express");
const cambiarEstado = require("../engine/estadoRestaurante");

module.exports = (pool) => {

  const router = express.Router();

  router.post("/estado", async (req, res) => {

    try {

      const { estado } = req.body;

      await cambiarEstado(pool, estado);

      res.json({
        ok: true,
        estado
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};