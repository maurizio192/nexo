const getProductosProveedores = async (pool) => {

    const result = await pool.query(`
        SELECT

            p.id,
            p.nombre,
            p.unidad,

            p.stock_actual,
            p.stock_minimo,
            p.stock_garantizado,

            p.categoria_id,
            cp.nombre AS categoria,

            p.ubicacion_id,
            u.nombre AS ubicacion,

            pr.id AS proveedor_id,
            pr.nombre AS proveedor

        FROM productos p

        LEFT JOIN categorias_productos cp
            ON cp.id = p.categoria_id

        LEFT JOIN ubicaciones u
            ON u.id = p.ubicacion_id

        LEFT JOIN productos_proveedores pp
            ON pp.producto_id = p.id

        LEFT JOIN proveedores pr
            ON pr.id = pp.proveedor_id

        ORDER BY p.nombre
    `);

    return result.rows;

};

const actualizarProveedorProducto = async (
    pool,
    productoId,
    proveedorId
) => {

    await pool.query(
        `
        INSERT INTO productos_proveedores
        (
            producto_id,
            proveedor_id
        )

        VALUES ($1,$2)

        ON CONFLICT (producto_id)

        DO UPDATE SET

        proveedor_id = EXCLUDED.proveedor_id
        `,
        [
            productoId,
            proveedorId
        ]
    );

};

module.exports = {

    getProductosProveedores,

    actualizarProveedorProducto

};