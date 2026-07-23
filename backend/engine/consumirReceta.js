module.exports = async function consumirReceta(
    pool,
    elaboracionId,
    cantidadProduccion
) {

    const receta = await pool.query(`
        SELECT
            producto_id,
            cantidad
        FROM receta_detalle
        WHERE elaboracion_id=$1
    `,[elaboracionId]);

    for (const ingrediente of receta.rows) {

        const consumo =
            ingrediente.cantidad * cantidadProduccion;

        await pool.query(`
            UPDATE productos
            SET stock_actual = stock_actual - $1
            WHERE id=$2
        `,[consumo, ingrediente.producto_id]);

    }

};