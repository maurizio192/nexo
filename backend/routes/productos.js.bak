const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM productos ORDER BY id"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        errore: "Errore del database",
      });

    }

  });

  return router;

};