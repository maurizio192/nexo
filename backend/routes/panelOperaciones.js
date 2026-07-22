const express = require("express");
const panelOperaciones = require("../engine/panelOperaciones");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const panel = await panelOperaciones(pool);

      res.json(panel);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};