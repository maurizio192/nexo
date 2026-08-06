const MotorEventos = require("./MotorEventos");

class MotorStock {

    constructor(pool) {

        this.pool = pool;
        this.eventos = new MotorEventos(pool);

    }

    async obtenerProducto(id) {

        const result = await this.pool.query(
            `
            SELECT *
            FROM productos
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0];

    }

    async obtenerProductosCriticos() {

        const result = await this.pool.query(
            `
            SELECT

                p.*,

                pr.id AS proveedor_id,
                pr.nombre AS proveedor

            FROM productos p

            LEFT JOIN productos_proveedores pp
                ON pp.producto_id = p.id

            LEFT JOIN proveedores pr
                ON pr.id = pp.proveedor_id

            WHERE p.stock_actual <= p.stock_minimo

            ORDER BY
                pr.nombre,
                p.nombre
            `
        );

        return result.rows;

    }

    async obtenerProductosBajoMinimo() {

        const result = await this.pool.query(
            `
            SELECT *

            FROM productos

            WHERE stock_actual < stock_minimo

            ORDER BY nombre
            `
        );

        return result.rows;

    }

    async obtenerProductosSinStock() {

        const result = await this.pool.query(
            `
            SELECT *

            FROM productos

            WHERE stock_actual <= 0

            ORDER BY nombre
            `
        );

        return result.rows;

    }

    async actualizarStock(productoId, cantidad) {

        await this.pool.query(
            `
            UPDATE productos

            SET stock_actual = $1

            WHERE id = $2
            `,
            [
                cantidad,
                productoId
            ]
        );

        const producto =
            await this.obtenerProducto(productoId);

        await this.eventos.registrar(

            "Sistema",

            "ACTUALIZAR_STOCK",

            `${producto.nombre} = ${cantidad}`

        );

    }

    async consumir(
        productoId,
        cantidad,
        usuario = "Sistema"
    ) {

        await this.pool.query(
            `
            UPDATE productos

            SET stock_actual = stock_actual - $1

            WHERE id = $2
            `,
            [
                cantidad,
                productoId
            ]
        );

        const producto =
            await this.obtenerProducto(productoId);

        await this.eventos.registrar(

            usuario,

            "CONSUMO",

            `${producto.nombre} (-${cantidad})`

        );

    }

    async reponer(
        productoId,
        cantidad,
        usuario = "Sistema"
    ) {

        await this.pool.query(
            `
            UPDATE productos

            SET stock_actual = stock_actual + $1

            WHERE id = $2
            `,
            [
                cantidad,
                productoId
            ]
        );

        const producto =
            await this.obtenerProducto(productoId);

        await this.eventos.registrar(

            usuario,

            "REPOSICION",

            `${producto.nombre} (+${cantidad})`

        );

    }

    calcularEstado(producto) {

        const actual =
            Number(producto.stock_actual);

        const minimo =
            Number(producto.stock_minimo);

        const garantizado =
            Number(producto.stock_garantizado);

        if (actual <= 0)
            return "CRITICO";

        if (actual < minimo)
            return "BAJO";

        if (actual < garantizado)
            return "GARANTIZADO";

        return "OK";

    }

}

module.exports = MotorStock;