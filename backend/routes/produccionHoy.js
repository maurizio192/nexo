const express = require("express");
const produccionHoy = require("../engine/produccionHoy");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const tareas = await produccionHoy(pool);

      res.json(tareas);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};