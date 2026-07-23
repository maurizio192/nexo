module.exports = async function tareasPendientes(pool) {

    const resultado = await pool.query(

        `
        SELECT
            nombre,
            categoria
        FROM tareas_produccion
        WHERE

            fecha = CURRENT_DATE

            AND estado='PENDIENTE'

        ORDER BY categoria,nombre
        `
    );

    return resultado.rows;

};