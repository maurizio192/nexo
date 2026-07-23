const express = require("express");
const tareasPendientes = require("../engine/tareasPendientes");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const tareas = await tareasPendientes(pool);

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


