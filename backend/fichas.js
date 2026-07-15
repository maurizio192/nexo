const express = require("express");
const router = express.Router();

module.exports = (pool) => {

    router.get("/", async (req, res) => {

        try {

            const resultado = await pool.query(`
                SELECT
                    id,
                    nombre
                FROM elaboraciones
                ORDER BY nombre
            `);

            res.json(resultado.rows);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Error cargando fichas técnicas"
            });

        }

    });

    return router;

};