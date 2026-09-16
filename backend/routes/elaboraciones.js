const express = require("express");

module.exports = (pool) => {

  const router = express.Router();

  // ==========================================
  // LISTAR ELABORACIONES
  // ==========================================

  router.get("/", async (req, res) => {

    try {

      const result = await pool.query(
        `
        SELECT *
        FROM elaboraciones
        ORDER BY nombre
        `
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message,
      });

    }

  });


  // ==========================================
  // OBTENER ELABORACIÓN DE UNA RECETA
  // ==========================================

  router.get("/receta/:receta_id", async (req, res) => {

    try {

      const { receta_id } = req.params;

      const result = await pool.query(
        `
        SELECT e.*
        FROM elaboraciones e
        WHERE e.receta_id = $1
        ORDER BY e.id
        LIMIT 1
        `,
        [receta_id]
      );

      if (result.rows.length === 0) {
        return res.json({
          ok: true,
          elaboracion: null
        });
      }

      res.json({
        ok: true,
        elaboracion: result.rows[0]
      });

    } catch (err) {

      console.error("❌ Error obteniendo elaboración de receta:", err);

      res.status(500).json({
        error: err.message
      });

    }

  });


  // ==========================================
  // CREAR ELABORACIÓN
  // ==========================================

  router.post("/", async (req, res) => {

    try {

      const {
  nombre,
  categoria,
  dias_conservacion,
  tipo_conservacion,
  receta_id,
  activa,
} = req.body;


      // ----------------------------------------
      // VALIDACIÓN
      // ----------------------------------------

      if (!nombre || !nombre.trim()) {

        return res.status(400).json({
          error: "El nombre de la elaboración es obligatorio",
        });

      }


      // ----------------------------------------
      // INSERTAR ELABORACIÓN
      // ----------------------------------------

      const result = await pool.query(
        `
       INSERT INTO elaboraciones
(
  nombre,
  categoria,
  dias_conservacion,
  tipo_conservacion,
  receta_id,
  activa
)
VALUES ($1,$2,$3,$4,$5,$6)
RETURNING *

        `,
        [
  nombre.trim(),
  categoria || null,
  dias_conservacion !== undefined && dias_conservacion !== ""
    ? Number(dias_conservacion)
    : null,
  tipo_conservacion || null,
  receta_id !== undefined && receta_id !== ""
    ? Number(receta_id)
    : null,
  activa !== undefined
    ? activa
    : true,
        ]
      );


      // ----------------------------------------
      // RESPUESTA
      // ----------------------------------------

      res.status(201).json({
        ok: true,
        elaboracion: result.rows[0],
      });

    } catch (err) {

      console.error("❌ Error creando elaboración:", err);

      res.status(500).json({
        error: err.message,
      });

    }

  });


  // ==========================================
  // DESCONTAR BOLSAS
  // ==========================================

  router.put("/:id/descontar", async (req, res) => {

    try {

      const { id } = req.params;
      const { cantidad } = req.body;


      // ----------------------------------------
      // VALIDACIÓN
      // ----------------------------------------

      if (!cantidad || Number(cantidad) <= 0) {

        return res.status(400).json({
          error: "La cantidad debe ser mayor que 0",
        });

      }


      // ----------------------------------------
      // COMPROBAR ELABORACIÓN
      // ----------------------------------------

      const existente = await pool.query(
        `
        SELECT *
        FROM elaboraciones
        WHERE id = $1
        `,
        [id]
      );


      if (existente.rows.length === 0) {

        return res.status(404).json({
          error: "Elaboración no encontrada",
        });

      }


      // ----------------------------------------
      // DESCONTAR
      // ----------------------------------------

      const result = await pool.query(
        `
        UPDATE elaboraciones
        SET bolsas_actuales = bolsas_actuales - $1
        WHERE id = $2
        RETURNING *
        `,
        [
          Number(cantidad),
          id,
        ]
      );


      res.json({
        ok: true,
        elaboracion: result.rows[0],
      });

    } catch (err) {

      console.error("❌ Error descontando elaboración:", err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  // ==========================================
  // VINCULAR ELABORACIÓN CON RECETA
  // ==========================================

  router.put("/:id/receta", async (req, res) => {

    try {

      const { id } = req.params;
      const { receta_id } = req.body;


      // ----------------------------------------
      // VALIDACIÓN
      // ----------------------------------------

      if (!receta_id) {

        return res.status(400).json({
          error: "El receta_id es obligatorio",
        });

      }


      // ----------------------------------------
      // COMPROBAR ELABORACIÓN
      // ----------------------------------------

      const elaboracion = await pool.query(
        `
        SELECT *
        FROM elaboraciones
        WHERE id = $1
        `,
        [id]
      );


      if (elaboracion.rows.length === 0) {

        return res.status(404).json({
          error: "Elaboración no encontrada",
        });

      }


      // ----------------------------------------
      // COMPROBAR RECETA
      // ----------------------------------------

      const receta = await pool.query(
        `
        SELECT *
        FROM recetas
        WHERE id = $1
        `,
        [receta_id]
      );


      if (receta.rows.length === 0) {

        return res.status(404).json({
          error: "Receta no encontrada",
        });

      }


      // ----------------------------------------
      // VINCULAR
      // ----------------------------------------

      const result = await pool.query(
        `
        UPDATE elaboraciones
        SET receta_id = $1
        WHERE id = $2
        RETURNING *
        `,
        [
          receta_id,
          id,
        ]
      );


      // ----------------------------------------
      // RESPUESTA
      // ----------------------------------------

      res.json({
        ok: true,
        elaboracion: result.rows[0],
        receta: receta.rows[0],
      });


    } catch (err) {

      console.error("❌ Error vinculando receta:", err);

      res.status(500).json({
        error: err.message,
      });

    }

  });

  return router;

};
