const MotorPedidos = require("./MotorPedidos");

class SanchoChat {

     constructor(pool) {
    this.pool = pool;
    this.motorPedidos = new MotorPedidos(pool);

    // Producto pendiente de confirmación por el usuario
    this.confirmacionPendiente = null;
}

    async procesar(pregunta) {

        const texto = String(pregunta || "")
            .trim()
            .toLowerCase();

                // CONFIRMAR PRODUCTO PENDIENTE

        if (this.confirmacionPendiente) {

            const pendiente =
                this.confirmacionPendiente;

            let producto = null;

            // -----------------------------------------
            // CONFIRMACIÓN POR NÚMERO
            // -----------------------------------------

            const seleccion =
                texto.match(
                    /^(?:la|el|opcion|opción|numero|número)?\s*(\d+)$/
                );

            if (seleccion) {

                const indice =
                    Number(seleccion[1]) - 1;

                if (
                    indice >= 0 &&
                    indice < pendiente.productos.length
                ) {

                    producto =
                        pendiente.productos[indice];
                }
            }

            // -----------------------------------------
            // CONFIRMACIÓN POR NOMBRE
            // -----------------------------------------

            if (!producto) {

                const buscado =
                    texto
                        .replace(/\s*\([^)]*\)/g, "")
                        .trim()
                        .toLowerCase();

                producto =
                    pendiente.productos.find(p => {

                        const nombre =
                            p.nombre
                                .replace(/\s*\([^)]*\)/g, "")
                                .trim()
                                .toLowerCase();

                        return (
                            nombre === buscado ||
                            nombre.includes(buscado) ||
                            buscado.includes(nombre)
                        );
                    });
            }

            // -----------------------------------------
            // PRODUCTO ENCONTRADO
            // -----------------------------------------

            if (producto) {

                this.confirmacionPendiente = null;

                if (!producto.proveedor_id) {

                    return {
                        respuesta:
                            `${producto.nombre} no tiene proveedor asignado en NEXO.`,
                        accion:
                            "PROVEEDOR_NO_ENCONTRADO"
                    };
                }

                const pedidoExistente =
                    await this.motorPedidos.obtenerPedidoPendiente(
                        producto.proveedor_id
                    );

                let pedidoId;

                if (pedidoExistente) {

                    pedidoId =
                        pedidoExistente.id;

                } else {

                    pedidoId =
                        await this.motorPedidos.crearPedido(
                            producto.proveedor_id
                        );
                }

                const mapaFormatos = {

                    caja: "CAJA",
                    cajas: "CAJA",

                    paquete: "PAQUETE",
                    paquetes: "PAQUETE",
                    paq: "PAQUETE",
                    paqs: "PAQUETE",

                    unidad: "UD",
                    unidades: "UD",
                    ud: "UD",
                    uds: "UD",

                    botella: "BOTELLA",
                    botellas: "BOTELLA",

                    bote: "BOTE",
                    botes: "BOTE",

                    pieza: "PIEZA",
                    piezas: "PIEZA"
                };

                const formatoSolicitado =
                    pendiente.unidadPedido
                        ? mapaFormatos[
                            pendiente.unidadPedido.toLowerCase()
                        ]
                        : null;

                const formatoFinal =
                    formatoSolicitado ||
                    producto.formato_compra ||
                    null;

                const detalle =
                    await this.motorPedidos.agregarProducto(
                        pedidoId,
                        producto,
                        pendiente.cantidad,
                        formatoFinal
                    );

                let formatoRespuesta =
                    pendiente.unidadPedido ||
                    formatoFinal ||
                    "";

                if (pendiente.cantidad !== 1) {

                    if (formatoRespuesta === "CAJA")
                        formatoRespuesta = "CAJAS";

                    if (formatoRespuesta === "PAQUETE")
                        formatoRespuesta = "PAQUETES";

                    if (formatoRespuesta === "BOTELLA")
                        formatoRespuesta = "BOTELLAS";

                    if (formatoRespuesta === "BOTE")
                        formatoRespuesta = "BOTES";

                    if (formatoRespuesta === "PIEZA")
                        formatoRespuesta = "PIEZAS";
                }

                return {

                    respuesta:
                        `Perfecto. He añadido ${pendiente.cantidad} ${formatoRespuesta} de ${producto.nombre} al pedido de ${producto.proveedor_nombre || "su proveedor"}. El pedido queda en borrador.`,

                    accion:
                        "AÑADIR_PRODUCTO",

                    pedido:
                        detalle,

                    proveedor:
                        producto.proveedor_nombre
                };
            }

            // -----------------------------------------
            // NO IDENTIFICADO
            // -----------------------------------------

            return {

                respuesta:
                    `No he identificado el producto. Puedes decirme el número (1-${pendiente.productos.length}) o el nombre.`,

                accion:
                    "CONFIRMAR_PRODUCTO",

                productos:
                    pendiente.productos
            };
        }
        // CONSULTAR STOCK

        if (
            texto.includes("bajo stock") ||
            texto.includes("bajo mínimo") ||
            texto.includes("bajo minimo") ||
            texto.includes("qué tenemos bajo") ||
            texto.includes("que tenemos bajo")
        ) {

            const result = await this.pool.query(`
                SELECT
                    p.id,
                    p.nombre,
                    p.stock_actual,
                    p.stock_minimo,
                    p.formato_compra,
                    p.cantidad_formato,
                    p.proveedor_id,
                    pr.nombre AS proveedor
                FROM productos p
                LEFT JOIN proveedores pr
                    ON p.proveedor_id = pr.id
                WHERE p.stock_actual < p.stock_minimo
                ORDER BY p.nombre
            `);

            if (result.rows.length === 0) {
                return {
                    respuesta:
                        "Ahora mismo no hay productos bajo stock mínimo.",
                    accion: "CONSULTAR_STOCK"
                };
            }

            const lista = result.rows
                .map(p =>
                    `- ${p.nombre}: ${p.stock_actual}/${p.stock_minimo}`
                )
                .join("\n");

            return {
                respuesta:
                    `Tenemos ${result.rows.length} productos bajo stock:\n${lista}`,
                accion: "CONSULTAR_STOCK",
                productos: result.rows
            };
        }

        // CONSULTAR PEDIDOS

        if (
            texto.includes("qué pedidos") ||
            texto.includes("que pedidos") ||
            texto.includes("pedidos preparados") ||
            texto.includes("pedidos tenemos")
        ) {

            const result = await this.pool.query(`
                SELECT
                    p.id,
                    p.proveedor,
                    p.estado,
                    d.producto,
                    d.cantidad,
                    d.formato
                FROM pedidos p
                LEFT JOIN pedido_detalle d
                    ON d.pedido_id = p.id
                WHERE p.estado = 'Pendiente'
                ORDER BY p.proveedor, d.producto
            `);

            if (result.rows.length === 0) {
                return {
                    respuesta:
                        "No tenemos pedidos pendientes preparados.",
                    accion: "CONSULTAR_PEDIDOS"
                };
            }

            const grupos = {};

            for (const row of result.rows) {

                if (!grupos[row.proveedor]) {
                    grupos[row.proveedor] = [];
                }

                if (row.producto) {
                    grupos[row.proveedor].push(
                        `${row.producto} (${row.cantidad}${row.formato ? " " + row.formato : ""})`
                    );
                }
            }

            let respuesta = "Estos son los pedidos preparados:\n";

            for (const proveedor of Object.keys(grupos)) {

                respuesta += `\n${proveedor}:\n`;

                for (const producto of grupos[proveedor]) {
                    respuesta += `- ${producto}\n`;
                }
            }

            return {
                respuesta,
                accion: "CONSULTAR_PEDIDOS"
            };
        }

        // PROVEEDORES DISPONIBLES HOY

        if (
            texto.includes("hacer el pedido") ||
            texto.includes("hacer pedidos") ||
            texto.includes("pedidos hoy") ||
            texto.includes("a quién") ||
            texto.includes("a quien")
        ) {

            const result = await this.pool.query(`
                SELECT
                    id,
                    nombre,
                    telefono,
                    contacto,
                    dia_pedido,
                    dia_entrega,
                    metodo_contacto,
                    notas
                FROM proveedores
                WHERE
                    dia_pedido IS NULL
                    OR
                    LOWER(dia_pedido) LIKE '%' ||
                    LOWER(
                        CASE EXTRACT(DOW FROM CURRENT_DATE)
                            WHEN 0 THEN 'domingo'
                            WHEN 1 THEN 'lunes'
                            WHEN 2 THEN 'martes'
                            WHEN 3 THEN 'miércoles'
                            WHEN 4 THEN 'jueves'
                            WHEN 5 THEN 'viernes'
                            WHEN 6 THEN 'sábado'
                        END
                    ) ||
                    '%'
                ORDER BY nombre
            `);

            const lista = result.rows
                .map(p => `- ${p.nombre}`)
                .join("\n");

            return {
                respuesta:
                    `Hoy puedes hacer pedidos a:\n${lista}\n\nLos proveedores sin día fijo también están disponibles.`,
                accion: "CONSULTAR_PROVEEDORES",
                proveedores: result.rows
            };
        }

        // AÑADIR PRODUCTO

        const patron = texto.match(
            /(?:pide|pedir|añade|añadir|agrega|agregar)\s+(\d+(?:[.,]\d+)?)\s*(cajas?|paquetes?|paqs?|unidades?|uds?|ud|botellas?|botes?|piezas?)?\s+(?:de\s+)?(.+)/
        );

        console.log("PATRON:", patron);

        if (patron) {

            const cantidad = Number(
                patron[1].replace(",", ".")
            );

            const unidadPedido =
                patron[2]
                    ? patron[2].toUpperCase()
                    : null;

            const nombreBuscado = patron[3]
                .replace(/\bpor favor\b/g, "")
                .trim();

            console.log("CANTIDAD:", cantidad);
            console.log("UNIDAD:", unidadPedido);
            console.log("PRODUCTO:", nombreBuscado);

            
                const result = await this.pool.query(`
    SELECT
        p.*,
        pr.nombre AS proveedor_nombre
    FROM productos p
    LEFT JOIN proveedores pr
        ON p.proveedor_id = pr.id
    WHERE
        LOWER(p.nombre) LIKE '%' || LOWER($1) || '%'
        OR
        LOWER(
            REGEXP_REPLACE(
                p.nombre,
                '\\\\s*\\\\([^)]*\\\\)',
                '',
                'g'
            )
        ) = LOWER($1)
    ORDER BY
        CASE
            WHEN LOWER(
                REGEXP_REPLACE(
                    p.nombre,
                    '\\\\s*\\\\([^)]*\\\\)',
                    '',
                    'g'
                )
            ) = LOWER($1)
            THEN 0

            WHEN LOWER(p.nombre) = LOWER($1)
            THEN 1

            ELSE 2
        END,
        p.nombre
    LIMIT 5
`, [nombreBuscado]);
                       if (result.rows.length === 0) {

    return {
        respuesta:
            `No encuentro el producto "${nombreBuscado}".`,
        accion: "PRODUCTO_NO_ENCONTRADO"
    };
} 

           if (result.rows.length > 1) {

    const productoExacto = result.rows.find(p => {

        const nombreSinCategoria = p.nombre
            .replace(/\s*\([^)]*\)/g, "")
            .trim()
            .toLowerCase();

        return nombreSinCategoria === nombreBuscado.toLowerCase();
    });

   if (productoExacto) {

    result.rows.splice(
        0,
        result.rows.length,
        productoExacto
    );

} else {

    this.confirmacionPendiente = {
        cantidad,
        unidadPedido,
        productos: result.rows
    };

    const opciones = result.rows
        .map(
            (p, i) =>
                `${i + 1}. ${p.nombre}`
        )
        .join("\n");

    return {
        respuesta:
            `He encontrado varios productos parecidos:\n${opciones}\nDime cuál quieres.`,
        accion: "CONFIRMAR_PRODUCTO",
        productos: result.rows
    };
}
}
            const producto = result.rows[0];

            if (!producto.proveedor_id) {

                return {
                    respuesta:
                        `${producto.nombre} no tiene proveedor asignado en NEXO.`,
                    accion: "PROVEEDOR_NO_ENCONTRADO"
                };
            }

            const pedidoExistente =
                await this.motorPedidos.obtenerPedidoPendiente(
                    producto.proveedor_id
                );

            let pedidoId;

            if (pedidoExistente) {

                pedidoId = pedidoExistente.id;

            } else {

                pedidoId =
                    await this.motorPedidos.crearPedido(
                        producto.proveedor_id
                    );
            }

            const mapaFormatos = {
    caja: "CAJA",
    cajas: "CAJA",

    paquete: "PAQUETE",
    paquetes: "PAQUETE",
    paq: "PAQUETE",
    paqs: "PAQUETE",

    unidad: "UD",
    unidades: "UD",
    ud: "UD",
    uds: "UD",

    botella: "BOTELLA",
    botellas: "BOTELLA",

    bote: "BOTE",
    botes: "BOTE",

    pieza: "PIEZA",
    piezas: "PIEZA"
};

const formatoSolicitado =
    unidadPedido
        ? mapaFormatos[unidadPedido.toLowerCase()]
        : null;

const formatoFinal =
    formatoSolicitado ||
    producto.formato_compra ||
    null;

const detalle =
    await this.motorPedidos.agregarProducto(
        pedidoId,
        producto,
        cantidad,
        formatoFinal
    );

   let formatoRespuesta =
    unidadPedido || formatoFinal || "";

if (cantidad !== 1) {
    if (formatoRespuesta === "CAJA") formatoRespuesta = "CAJAS";
    if (formatoRespuesta === "PAQUETE") formatoRespuesta = "PAQUETES";
    if (formatoRespuesta === "BOTELLA") formatoRespuesta = "BOTELLAS";
    if (formatoRespuesta === "BOTE") formatoRespuesta = "BOTES";
    if (formatoRespuesta === "PIEZA") formatoRespuesta = "PIEZAS";
}

            return {

                respuesta:
                    `Perfecto. He añadido ${cantidad} ${formatoRespuesta} de ${producto.nombre} al pedido de ${producto.proveedor_nombre || "su proveedor"}. El pedido queda en borrador.`,

                accion: "AÑADIR_PRODUCTO",

                pedido: detalle,

                proveedor: producto.proveedor_nombre

            };
        }
    // AYUDA

    return {
        respuesta:
            "Te puedo ayudar con los pedidos. Por ejemplo: «tenemos que hacer el pedido», «dime qué tenemos bajo stock», «pide 2 cajas de harina» o «qué pedidos tenemos preparados».",
        accion: "AYUDA"
    };
    }
}

module.exports = SanchoChat;