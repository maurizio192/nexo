const MotorStock = require("./MotorStock");
const MotorEventos = require("./MotorEventos");

class MotorPedidos {

    constructor(pool) {

        this.pool = pool;

        this.stock = new MotorStock(pool);

        this.eventos = new MotorEventos(pool);

    }


    async obtenerPedidoPendiente(proveedorId) {

        const result = await this.pool.query(
            `
            SELECT id
            FROM pedidos
            WHERE proveedor_id = $1
            AND estado = 'Pendiente'
            LIMIT 1
            `,
            [
                proveedorId
            ]
        );

        return result.rows[0];
    }


    async crearPedido(proveedorId) {

        const proveedor = await this.pool.query(
            `
            SELECT nombre
            FROM proveedores
            WHERE id = $1
            `,
            [
                proveedorId
            ]
        );

        if (!proveedor.rows[0]) {

            throw new Error(
                "Proveedor no encontrado: " + proveedorId
            );

        }

        const result = await this.pool.query(
            `
            INSERT INTO pedidos
            (
                proveedor_id,
                proveedor,
                estado,
                fecha
            )
            VALUES
            (
                $1,
                $2,
                'Pendiente',
                NOW()
            )
            RETURNING id
            `,
            [
                proveedorId,
                proveedor.rows[0].nombre
            ]
        );

        return result.rows[0].id;
    }


    async agregarProducto(
        pedidoId,
        producto,
        cantidad = null,
        formato = null
    ) {

        const stockActual =
            Number(producto.stock_actual || 0);

        const stockMinimo =
            Number(producto.stock_minimo || 0);

        const stockGarantizado =
            Number(producto.stock_garantizado || 0);

        const stockObjetivo =
            Math.max(
                stockMinimo,
                stockGarantizado
            );

        const cantidadNecesaria =
            Math.max(
                0,
                stockObjetivo - stockActual
            );

        const cantidadFormato =
            Number(producto.cantidad_formato || 0);

        const cantidadUnidad =
            Number(producto.cantidad_unidad || 0);

        const formatoFinal =
            formato ||
            producto.formato_compra ||
            null;

        const unidadFormato =
            producto.unidad_formato ||
            "UDS";

        const unidadProducto =
            producto.unidad_producto ||
            null;

        let cantidadFinal;


        /*
         * Cantidad manual indicada por Sancho.
         */
        if (cantidad !== null) {

            cantidadFinal =
                Number(cantidad);

        } else {

            /*
             * Cantidad real contenida en un formato.
             *
             * Ejemplo:
             *
             * CAJA
             * 6 BOTELLAS
             * 1 L por botella
             *
             * 6 x 1 = 6 L por caja
             */

            const cantidadPorFormato =
                cantidadFormato > 0 &&
                cantidadUnidad > 0
                    ? cantidadFormato * cantidadUnidad
                    : 0;


            if (
                cantidadPorFormato > 0 &&
                cantidadNecesaria > 0
            ) {

                cantidadFinal =
                    Math.ceil(
                        cantidadNecesaria /
                        cantidadPorFormato
                    );

            } else {

                cantidadFinal =
                    cantidadNecesaria;

            }
        }


        /*
         * Descripción legible para Sancho.
         */

        const formatoDescripcion =
            cantidadFinal === 1
                ? (formatoFinal || "UDS")
                : (formatoFinal === "CAJA"
                    ? "CAJAS"
                    : formatoFinal === "PAQUETE"
                        ? "PAQUETES"
                        : formatoFinal || "UDS");

        let descripcionCantidad =
            `${cantidadFinal} ${formatoDescripcion}`;


        if (
            cantidadFormato > 0 &&
            unidadFormato
        ) {

            const cantidadTotalFormato =
                cantidadFinal * cantidadFormato;

            let contenido =
                `${cantidadTotalFormato} ${unidadFormato}`;


            if (
                cantidadUnidad > 0 &&
                unidadProducto
            ) {

                contenido +=
                    ` × ${cantidadUnidad} ${unidadProducto}`;

            }


            descripcionCantidad +=
                ` (${contenido})`;
        }


        await this.pool.query(
            `
            INSERT INTO pedido_detalle
            (
                pedido_id,
                producto,
                cantidad,
                formato
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )
            ON CONFLICT
            (
                pedido_id,
                producto
            )
            DO UPDATE SET
                cantidad = EXCLUDED.cantidad,
                formato = EXCLUDED.formato
            `,
            [
                pedidoId,
                producto.nombre,
                cantidadFinal,
                formatoFinal
            ]
        );


        return {

            pedido_id:
                pedidoId,

            producto:
                producto.nombre,

            cantidad:
                cantidadFinal,

            formato:
                formatoFinal,

            cantidad_formato:
                cantidadFormato,

            unidad_formato:
                unidadFormato,

            cantidad_unidad:
                cantidadUnidad,

            unidad_producto:
                unidadProducto,

            descripcion_cantidad:
                descripcionCantidad

        };
    }


    async previsualizarPedidosAutomaticos() {

        const criticos =
            await this.stock.obtenerProductosCriticos();

        const propuestas = [];

        const dias = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado"
        ];

        const hoy =
            dias[new Date().getDay()];

        for (const producto of criticos) {

            if (!producto.proveedor_id) {
                continue;
            }

            const proveedorResult =
                await this.pool.query(
                    `
                    SELECT
                        id,
                        nombre,
                        dia_pedido
                    FROM proveedores
                    WHERE id = $1
                    `,
                    [
                        producto.proveedor_id
                    ]
                );

            const proveedor =
                proveedorResult.rows[0];

            if (!proveedor) {
                continue;
            }

            const regla =
                String(
                    proveedor.dia_pedido || ""
                ).trim();

            let disponible = false;

            if (
                regla === "" ||
                regla.toLowerCase() ===
                    "segun necesidad"
            ) {

                disponible = true;

            } else {

                const diasPermitidos =
                    regla
                        .split("/")
                        .map(d =>
                            d
                                .replace(
                                    /antes.*$/i,
                                    ""
                                )
                                .trim()
                        )
                        .filter(Boolean);

                disponible =
                    diasPermitidos.includes(hoy);
            }

            if (!disponible) {
                continue;
            }

            if (
                regla
                    .toLowerCase()
                    .includes(
                        "antes de las 13"
                    )
            ) {

                const ahora =
                    new Date();

                const hora =
                    ahora.getHours();

                if (hora >= 13) {
                    continue;
                }
            }

            const stockActual =
                Number(producto.stock_actual || 0);

            const stockMinimo =
                Number(producto.stock_minimo || 0);

            const stockGarantizado =
                Number(producto.stock_garantizado || 0);

            const stockObjetivo =
                Math.max(
                    stockMinimo,
                    stockGarantizado
                );

            const cantidadNecesaria =
                Math.max(
                    0,
                    stockObjetivo - stockActual
                );

            const cantidadFormato =
                Number(producto.cantidad_formato || 0);

            const cantidadUnidad =
                Number(producto.cantidad_unidad || 0);

            const formatoFinal =
                producto.formato_compra ||
                null;

            const unidadFormato =
                producto.unidad_formato ||
                "UDS";

            const unidadProducto =
                producto.unidad_producto ||
                null;

            const cantidadPorFormato =
                cantidadFormato > 0 &&
                cantidadUnidad > 0
                    ? cantidadFormato * cantidadUnidad
                    : 0;

            let cantidadFinal;

            if (
                cantidadPorFormato > 0 &&
                cantidadNecesaria > 0
            ) {

                cantidadFinal =
                    Math.ceil(
                        cantidadNecesaria /
                        cantidadPorFormato
                    );

            } else {

                cantidadFinal =
                    cantidadNecesaria;
            }

            const formatoDescripcion =
                cantidadFinal === 1
                    ? (formatoFinal || "UDS")
                    : (formatoFinal === "CAJA"
                        ? "CAJAS"
                        : formatoFinal === "PAQUETE"
                            ? "PAQUETES"
                            : formatoFinal || "UDS");

            let descripcionCantidad =
                `${cantidadFinal} ${formatoDescripcion}`;

            if (
                cantidadFormato > 0 &&
                unidadFormato
            ) {

                const cantidadTotalFormato =
                    cantidadFinal * cantidadFormato;

                let contenido =
                    `${cantidadTotalFormato} ${unidadFormato}`;

                if (
                    cantidadUnidad > 0 &&
                    unidadProducto
                ) {

                    contenido +=
                        ` × ${cantidadUnidad} ${unidadProducto}`;
                }

                descripcionCantidad +=
                    ` (${contenido})`;
            }

            const existente =
                await this.obtenerPedidoPendiente(
                    producto.proveedor_id
                );

            propuestas.push({
                proveedor_id:
                    producto.proveedor_id,

                proveedor:
                    proveedor.nombre,

                pedido_pendiente_id:
                    existente
                        ? existente.id
                        : null,

                producto_id:
                    producto.id,

                producto:
                    producto.nombre,

                stock_actual:
                    stockActual,

                stock_objetivo:
                    stockObjetivo,

                cantidad_necesaria:
                    cantidadNecesaria,

                cantidad:
                    cantidadFinal,

                formato:
                    formatoFinal,

                cantidad_formato:
                    cantidadFormato,

                unidad_formato:
                    unidadFormato,

                cantidad_unidad:
                    cantidadUnidad,

                unidad_producto:
                    unidadProducto,

                descripcion_cantidad:
                    descripcionCantidad
            });
        }

        return propuestas;
    }


    async generarPedidosAutomaticos() {

        const criticos =
            await this.stock.obtenerProductosCriticos();


        const pedidos = [];


        const dias = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado"
        ];


        const hoy =
            dias[new Date().getDay()];


        for (const producto of criticos) {


            /*
             * Producto sin proveedor:
             * no podemos generar pedido.
             */

            if (!producto.proveedor_id) {

                continue;

            }


            const proveedorResult =
                await this.pool.query(
                    `
                    SELECT
                        id,
                        nombre,
                        dia_pedido
                    FROM proveedores
                    WHERE id = $1
                    `,
                    [
                        producto.proveedor_id
                    ]
                );


            const proveedor =
                proveedorResult.rows[0];


            if (!proveedor) {

                continue;

            }


            const regla =
                String(
                    proveedor.dia_pedido || ""
                ).trim();


            let disponible = false;


            /*
             * Sin restricción:
             * se puede pedir siempre.
             */

            if (
                regla === "" ||
                regla.toLowerCase() ===
                    "segun necesidad"
            ) {

                disponible = true;

            } else {


                const diasPermitidos =
                    regla
                        .split("/")
                        .map(d =>
                            d
                                .replace(
                                    /antes.*$/i,
                                    ""
                                )
                                .trim()
                        )
                        .filter(Boolean);


                disponible =
                    diasPermitidos.includes(hoy);

            }


            if (!disponible) {

                continue;

            }


            /*
             * Control de horario.
             */

            if (
                regla
                    .toLowerCase()
                    .includes(
                        "antes de las 13"
                    )
            ) {

                const ahora =
                    new Date();

                const hora =
                    ahora.getHours();


                if (hora >= 13) {

                    continue;

                }
            }


            let pedidoId;


            /*
             * Buscar pedido pendiente.
             */

            const existente =
                await this.obtenerPedidoPendiente(
                    producto.proveedor_id
                );


            if (existente) {

                pedidoId =
                    existente.id;

            } else {

                pedidoId =
                    await this.crearPedido(
                        producto.proveedor_id
                    );

            }


            /*
             * Añadir producto.
             */

            await this.agregarProducto(
                pedidoId,
                producto
            );


            /*
             * Guardar ID una sola vez.
             */

            if (
                !pedidos.includes(pedidoId)
            ) {

                pedidos.push(
                    pedidoId
                );

            }

        }


        await this.eventos.registrar(
            "Sancho",
            "PEDIDOS_AUTOMATICOS",
            `Pedidos generados: ${pedidos.length}`
        );


        return pedidos;
    }

}


module.exports = MotorPedidos;

