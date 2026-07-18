const express = require("express");
const router = express.Router();

const sancho = require("../motor/sancho");

router.get("/", async (req, res) => {

  console.log("👉 ENTRANDO EN ROUTE SANCHO");

  try {

    const pool = req.app.locals.pool;

    if (!pool) {
      throw new Error("Pool PostgreSQL no inicializado");
    }

    const resultado = await sancho.generarAvisos(pool);

    res.json(resultado);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;