const express = require("express");
const router = express.Router();

const {
    getProductosProveedores,
    actualizarProveedorProducto
} = require("../services/productosProveedoresService");

module.exports = (pool) => {

    // Obtener todos los productos con su proveedor
    router.get("/", async (req, res) => {

        try {

            const datos = await getProductosProveedores(pool);

            res.json(datos);

        } catch (err) {

            console.error("Error obteniendo productos:", err);

            res.status(500).json({
                error: err.message
            });

        }

    });

    // Cambiar proveedor de un producto
    router.put("/:productoId", async (req, res) => {

        try {

            const { productoId } = req.params;
            const { proveedor_id } = req.body;

            await actualizarProveedorProducto(
                pool,
                productoId,
                proveedor_id
            );

            res.json({
                ok: true
            });

        } catch (err) {

            console.error("Error actualizando proveedor:", err);

            res.status(500).json({
                error: err.message
            });

        }

    });

    return router;

};