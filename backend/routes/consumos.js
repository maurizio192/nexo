const express = require("express");
const consumos = require("../motor/consumos");
const motor = require("../motor");

module.exports = (pool) => {

  const router = express.Router();

  router.post("/:id", async (req, res) => {

    try {

      const { id } = req.params;

      await consumos.registrarConsumo(
        pool,
        id,
        1
      );

      await motor.iniciarMotor(pool);

      res.json({
        ok: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });
// Eliminar producto
router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM productos WHERE id = $1",
      [id]
    );

    res.json({
      ok: true,
      mensaje: "Producto eliminado correctamente",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  }

});
  return router;

};