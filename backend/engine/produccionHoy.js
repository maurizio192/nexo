module.exports = async function produccionHoy(pool) {
    
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
  const tareas = await pool.query(`
    SELECT
      id,
      nombre,
      categoria,
      estado
    FROM tareas_produccion
    WHERE fecha = CURRENT_DATE
    ORDER BY categoria, nombre
  `);

  return tareas.rows;

};