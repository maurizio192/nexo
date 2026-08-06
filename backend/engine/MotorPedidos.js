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
        producto
    ) {


        const cantidad = Math.max(

            Number(producto.stock_minimo || 0),

            Number(producto.stock_garantizado || 0)

        );



        await this.pool.query(
    `
    INSERT INTO pedido_detalle
    (
        pedido_id,
        producto,
        cantidad
    )

    VALUES
    (
        $1,
        $2,
        $3
    )

    ON CONFLICT
    (
        pedido_id,
        producto
    )

    DO UPDATE SET

    cantidad = EXCLUDED.cantidad

    `,
    [
        pedidoId,
        producto.nombre,
        cantidad
    ]
);

 }



    async generarPedidosAutomaticos() {


        const criticos =
            await this.stock.obtenerProductosCriticos();



        const pedidos = [];



        for (const producto of criticos) {



            if (!producto.proveedor_id) {

                continue;

            }




            let pedidoId;



            const existente =
                await this.obtenerPedidoPendiente(
                    producto.proveedor_id
                );



            if (existente) {


                pedidoId = existente.id;


            } else {


                pedidoId =
                    await this.crearPedido(
                        producto.proveedor_id
                    );

            }




            await this.agregarProducto(
                pedidoId,
                producto
            );




            if (!pedidos.includes(pedidoId)) {

                pedidos.push(pedidoId);

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

