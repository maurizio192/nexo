module.exports = async function finalizarTarea(pool, nombre) {

    const resultado = await pool.query(

        `
        UPDATE tareas_produccion
        SET

            estado='HECHO',

            terminado=NOW()

        WHERE

            LOWER(nombre)=LOWER($1)

            AND fecha=CURRENT_DATE

        RETURNING *
        `,

        [nombre]

    );

    return resultado.rows;

};