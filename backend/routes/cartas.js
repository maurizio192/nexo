const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        "SELECT * FROM cartas ORDER BY id"
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });

    }

  });

  return router;

};