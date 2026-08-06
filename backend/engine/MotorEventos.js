class MotorEventos {

    constructor(pool) {

        this.pool = pool;

    }

    async registrar(
        usuario,
        accion,
        detalle
    ) {

        await this.pool.query(
            `
            INSERT INTO eventos_nexo
            (
                usuario,
                accion,
                detalle
            )

            VALUES
            ($1,$2,$3)
            `,
            [
                usuario,
                accion,
                detalle
            ]
        );

    }

}

module.exports = MotorEventos;