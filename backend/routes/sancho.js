const express = require("express");
const router = express.Router();

const sancho = require("../motor/sancho");

router.get("/", async (req, res) => {

    console.log("👉 ENTRANDO EN ROUTE SANCHO");

    try {

        const pool = req.app.locals.pool;

        const datos = await sancho.generarAvisos(pool);

res.json(datos);

        res.json({ avisos });

    } catch (err) {

        console.error("========== ERROR SANCHO ==========");
        console.error(err);
        console.error(err.stack);
        console.error("==================================");

        res.status(500).json({
            error: err.message,
            stack: err.stack
        });

    }

});

module.exports = router;