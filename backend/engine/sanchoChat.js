const MotorPedidos = require("./MotorPedidos");

console.log("🔥 SANCHOCHAT.JS CARGADO");
class SanchoChat {

     constructor(pool) {
    this.pool = pool;
    this.motorPedidos = new MotorPedidos(pool);

    // Producto pendiente de confirmación por el usuario
    this.confirmacionPendiente = null;

    // Pedidos pendientes de selección por el usuario
    this.seleccionPedidoPendiente = null;
}

    async procesar(pregunta) {
        console.log("🔥 SANCHO PROCESAR RECIBE:", pregunta);

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
  
        // =========================================
        // RECEPCIONAR PEDIDO POR PROVEEDOR
        // =========================================

        const patronRecepcion =
            texto.match(
                /(?:ha llegado el pedido|ha llegado|lleg[oó] el pedido|llego el pedido|recibimos el pedido|recibimos|ha venido el pedido|ya lleg[oó] el pedido|recibir el pedido)\s+(?:de\s+|del\s+)?(.+)/i
            );

        if (patronRecepcion) {

            const proveedorBuscado =
                patronRecepcion[1]
                    .replace(/[?.!,¿¡]/g, "")
                    .trim();

            console.log(
                "📦 SANCHO BUSCA PEDIDO DEL PROVEEDOR:",
                proveedorBuscado
            );

            const proveedorResult =
                await this.pool.query(
                    `
                    SELECT
                        id,
                        nombre
                    FROM proveedores
                    WHERE
                        LOWER(nombre) = LOWER($1)
                        OR LOWER(nombre) LIKE '%' || LOWER($1) || '%'
                        OR LOWER($1) LIKE '%' || LOWER(nombre) || '%'
                    ORDER BY
                        CASE
                            WHEN LOWER(nombre) = LOWER($1)
                            THEN 0
                            ELSE 1
                        END
                    LIMIT 1
                    `,
                    [proveedorBuscado]
                );

            if (proveedorResult.rows.length === 0) {

                return {
                    respuesta:
                        `No he encontrado el proveedor "${proveedorBuscado}" en NEXO.`,
                    accion:
                        "PROVEEDOR_NO_ENCONTRADO"
                };

            }

            const proveedor =
                proveedorResult.rows[0];

            const pedidosResult =
                await this.pool.query(
                    `
                    SELECT
                        p.id,
                        p.proveedor,
                        p.estado,
                        COUNT(d.id) AS productos
                    FROM pedidos p
                    LEFT JOIN pedido_detalle d
                        ON d.pedido_id = p.id
                    WHERE
                        p.proveedor_id = $1
                        AND p.estado = 'Pendiente'
                    GROUP BY
                        p.id,
                        p.proveedor,
                        p.estado
                    ORDER BY
                        p.id DESC
                    `,
                    [proveedor.id]
                );

            if (pedidosResult.rows.length === 0) {

                return {
                    respuesta:
                        `No hay ningún pedido pendiente de ${proveedor.nombre}.`,
                    accion:
                        "PEDIDO_NO_ENCONTRADO",
                    proveedor:
                        proveedor.nombre
                };

            }

            // -----------------------------------------
            // UN ÚNICO PEDIDO PENDIENTE
            // -----------------------------------------

            if (pedidosResult.rows.length === 1) {

                const pedidoId =
                    pedidosResult.rows[0].id;

                console.log(
                    `📦 SANCHO RECEPCIONA PEDIDO ${pedidoId} DE ${proveedor.nombre}`
                );

                const pedidosService =
                    require("../services/pedidosService");

                const resultado =
                    await pedidosService.recibirPedido(
                        this.pool,
                        pedidoId
                    );

                return {
                    respuesta:
                        `Perfecto. He registrado la recepción del pedido de ${proveedor.nombre}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`,
                    accion:
                        "RECIBIR_PEDIDO",
                    pedido:
                        resultado,
                    proveedor:
                        proveedor.nombre
                };

            }

            // -----------------------------------------
            // VARIOS PEDIDOS PENDIENTES
            // -----------------------------------------

            // Guardar los pedidos para la siguiente respuesta
            this.seleccionPedidoPendiente = {
                proveedor: proveedor.nombre,
                pedidos: pedidosResult.rows
            };

            // Obtener el contenido de cada pedido
            for (const pedido of this.seleccionPedidoPendiente.pedidos) {

                const detalle = await this.pool.query(
                    `
                    SELECT producto, cantidad, formato
                    FROM pedido_detalle
                    WHERE pedido_id = $1
                    ORDER BY producto
                    `,
                    [pedido.id]
                );

                pedido.detalle = detalle.rows;
            }

            const lista =
                this.seleccionPedidoPendiente.pedidos
                    .map((p, i) => {

                        const contenido =
                            (p.detalle || [])
                                .map(d =>
                                    `${d.cantidad} ${d.formato || "UDS"} de ${d.producto}`
                                )
                                .join(", ");

                        return `${i + 1}. ${contenido}`;
                    })
                    .join("\n");

            return {
                respuesta:
                    `Hay varios pedidos pendientes de ${proveedor.nombre}. ¿Cuál ha llegado?\n${lista}`,
                accion:
                    "SELECCIONAR_PEDIDO",
                proveedor:
                    proveedor.nombre,
                pedidos:
                    this.seleccionPedidoPendiente.pedidos
            };
        }

        // =========================================
        // SELECCIONAR PEDIDO PENDIENTE
        // =========================================

        if (this.seleccionPedidoPendiente) {

            const seleccion =
                this.seleccionPedidoPendiente;

            let pedidoSeleccionado = null;

            // -----------------------------------------
            // SELECCIÓN POR NÚMERO
            // -----------------------------------------

            const numero =
                texto.match(/^(?:el\s+)?(?:pedido\s+)?(\d+)$/i);

            if (numero) {

                const indice =
                    Number(numero[1]) - 1;

                if (
                    indice >= 0 &&
                    indice < seleccion.pedidos.length
                ) {
                    pedidoSeleccionado =
                        seleccion.pedidos[indice];
                }
            }

            // -----------------------------------------
            // PRIMERO / SEGUNDO / TERCERO
            // -----------------------------------------

            if (!pedidoSeleccionado) {

                const posiciones = {
                    "primero": 0,
                    "primera": 0,
                    "segundo": 1,
                    "segunda": 1,
                    "tercero": 2,
                    "tercera": 2
                };

                const posicion =
                    texto.match(
                        /^(?:el\s+|la\s+)?(primero|primera|segundo|segunda|tercero|tercera)$/i
                    );

                if (posicion) {

                    const indice =
                        posiciones[posicion[1]];

                    if (
                        indice !== undefined &&
                        indice < seleccion.pedidos.length
                    ) {
                        pedidoSeleccionado =
                            seleccion.pedidos[indice];
                    }
                }
            }

            // -----------------------------------------
            // SELECCIÓN POR PRODUCTO
            // -----------------------------------------

            if (!pedidoSeleccionado) {

                for (const pedido of seleccion.pedidos) {

                    for (const detalle of (pedido.detalle || [])) {

                        const producto =
                            String(detalle.producto || "")
                                .toLowerCase();

                        const palabras =
                            producto
                                .split(/\s+/)
                                .filter(p => p.length >= 4);

                        const coincide =
                            palabras.some(palabra =>
                                texto.includes(palabra)
                            );

                        if (coincide) {

                            pedidoSeleccionado =
                                pedido;

                            break;
                        }
                    }

                    if (pedidoSeleccionado) {
                        break;
                    }
                }
            }

            // -----------------------------------------
            // PEDIDO ENCONTRADO
            // -----------------------------------------

            if (pedidoSeleccionado) {

                this.seleccionPedidoPendiente = null;

                const pedidosService =
                    require("../services/pedidosService");

                const resultado =
                    await pedidosService.recibirPedido(
                        this.pool,
                        pedidoSeleccionado.id
                    );

                return {
                    respuesta:
                        `Perfecto. He registrado la recepción del pedido de ${seleccion.proveedor}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`,

                    accion:
                        "RECIBIR_PEDIDO",

                    pedido:
                        resultado,

                    proveedor:
                        seleccion.proveedor
                };
            }

            // -----------------------------------------
            // NO IDENTIFICADO
            // -----------------------------------------

            return {
                respuesta:
                    `No he identificado cuál ha llegado. Puedes decirme "el primero", "el segundo" o indicarme un producto del pedido.`,

                accion:
                    "SELECCIONAR_PEDIDO",

                proveedor:
                    seleccion.proveedor,

                pedidos:
                    seleccion.pedidos
            };
        }

        // CONSULTAR STOCK DE PRODUCTO

        const patronStockProducto = texto.match(
            /(?:cu[aá]nto\s+stock\s+tenemos\s+de\s+(.+)|cu[aá]nto\s+tenemos\s+de\s+(.+)|cu[aá]ntas\s+tenemos\s+de\s+(.+)|qu[eé]\s+stock\s+tenemos\s+de\s+(.+)|stock\s+de\s+(.+)|cu[aá]nto\s+(.+?)\s+tenemos|cu[aá]ntas\s+(.+?)\s+tenemos|cu[aá]ntas\s+quedan\s+de\s+(.+)|cu[aá]nto\s+queda\s+de\s+(.+))/i
        );

        if (patronStockProducto) {

            const nombreBuscado = (
                patronStockProducto[1] ||
                patronStockProducto[2] ||
                patronStockProducto[3] ||
                patronStockProducto[4] ||
                patronStockProducto[5] ||
                patronStockProducto[6] ||
                patronStockProducto[7] ||
                patronStockProducto[8] ||
                patronStockProducto[9]
            )
                .replace(/[?¿]/g, "")
                .replace(/\bpor favor\b/gi, "")
                .replace(/^(el|la|los|las|un|una)\s+/i, "")
                .trim();

            console.log("🔥 BUSCANDO STOCK:", nombreBuscado);

            const palabras = nombreBuscado
                .split(/\s+/)
                .filter(Boolean);

            if (palabras.length === 0) {
                return {
                    respuesta: "Dime qué producto quieres consultar.",
                    accion: "CONSULTAR_STOCK"
                };
            }

            const condiciones = palabras
                .map((_, i) => `LOWER(p.nombre) LIKE $${i + 1}`)
                .join(" AND ");

            const valores = palabras.map(p => `%${p.toLowerCase()}%`);

            const result = await this.pool.query(`
                SELECT
                    p.*,
                    pr.nombre AS proveedor_nombre
                FROM productos p
                LEFT JOIN proveedores pr
                    ON p.proveedor_id = pr.id
                WHERE ${condiciones}
                ORDER BY p.nombre
                LIMIT 5
            `, valores);

            if (result.rows.length === 0) {
                return {
                    respuesta:
                        `No encuentro el producto "${nombreBuscado}".`,
                    accion: "PRODUCTO_NO_ENCONTRADO"
                };
            }

            if (result.rows.length > 1) {

                const productoExacto = result.rows.find(p =>
                    p.nombre.trim().toLowerCase() === nombreBuscado.trim().toLowerCase()
                );

                if (productoExacto) {
                    return {
                        respuesta:
                            `${productoExacto.nombre} tiene ${productoExacto.stock_actual} ${productoExacto.unidad || "unidades"} en stock.`,
                        accion: "CONSULTAR_STOCK",
                        producto: productoExacto
                    };
                }

                const lista = result.rows
                    .map(p =>
                        `- ${p.nombre}: ${p.stock_actual} ${p.unidad || ""}`
                    )
                    .join("\n");

                return {
                    respuesta:
                        `He encontrado varios productos:\n${lista}`,
                    accion: "CONSULTAR_STOCK",
                    productos: result.rows
                };
            }

            const producto = result.rows[0];

            return {
                respuesta:
                    `${producto.nombre} tiene ${producto.stock_actual} ${producto.unidad || "unidades"} en stock.`,
                accion: "CONSULTAR_STOCK",
                producto
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
                    `Tenemos ${result.rows.length} productos bajo stock:
${lista}`,
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

                respuesta += `
${proveedor}:
`;

                for (const producto of grupos[proveedor]) {
                    respuesta += `- ${producto}
`;
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
    texto.includes("qué proveedores") ||
    texto.includes("que proveedores") ||
    texto.includes("proveedores hoy") ||
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
                    `Hoy puedes hacer pedidos a:
${lista}

Los proveedores sin día fijo también están disponibles.`,
                accion: "CONSULTAR_PROVEEDORES",
                proveedores: result.rows
            };
        }
        // CONSULTAR UBICACIÓN DE PRODUCTO

        const patronUbicacion = texto.match(/(?:dónde está|donde está|dónde se encuentra|donde se encuentra|dónde tenemos|donde tenemos|ubicación de|ubicacion de)\s+(.+)/i);

        if (patronUbicacion) {
            const nombreBuscado = patronUbicacion[1]
                .replace(/^(el|la|los|las|un|una)\s+/i, "")
                .replace(/[?¿]/g, "")
                .replace(/\bpor favor\b/gi, "")
                .trim();
            console.log("TEXTO SANCHO:", texto);

            console.log("BUSCANDO UBICACIÓN:", nombreBuscado);

           const result = await this.pool.query(`
    SELECT
        p.*,
        pr.nombre AS proveedor_nombre,
        u.nombre AS ubicacion_nombre
    FROM productos p

    LEFT JOIN proveedores pr
        ON p.proveedor_id = pr.id

    LEFT JOIN ubicaciones u
        ON p.ubicacion_id = u.id

    WHERE
        LOWER(p.nombre) = LOWER($1)

        OR LOWER(p.nombre) LIKE '%' || LOWER($1) || '%'

        OR LOWER(
            REGEXP_REPLACE(
                p.nombre,
                '\\s*\\([^)]*\\)',
                '',
                'g'
            )
        ) = LOWER($1)

        OR (
            SELECT COUNT(*)
            FROM regexp_split_to_table(
                LOWER(
                    REGEXP_REPLACE(
                        p.nombre,
                        '\\s*\\([^)]*\\)',
                        '',
                        'g'
                    )
                ),
                '\\s+'
            ) palabras
            WHERE LOWER($1) LIKE '%' || palabras || '%'
        ) >= array_length(
            regexp_split_to_array(
                LOWER($1),
                '\\s+'
            ),
            1
        )

    ORDER BY
        CASE
            WHEN LOWER(p.nombre) = LOWER($1)
            THEN 0

            WHEN LOWER(p.nombre) LIKE '%' || LOWER($1) || '%'
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

            const producto = result.rows[0];

            return {
                respuesta:
                    producto.ubicacion_nombre
                        ? `${producto.nombre} está en ${producto.ubicacion_nombre}.`
                        : `${producto.nombre} no tiene una ubicación asignada.`,
                accion: "CONSULTAR_UBICACION",
                producto: producto
            };
        }


        // AÑADIR PRODUCTO

        const patron = texto.match(
            /^(?:pide|pedir|añade|añadir|agrega|agregar|necesitamos|necesito|quiero|queremos)\s+(\d+(?:[.,]\d+)?)\s*(cajas?|paquetes?|paqs?|unidades?|uds?|ud|botellas?|botes?|piezas?)?\s+(?:de\s+)?(.+)$/i
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
    .replace(/^(el|la|los|las|un|una)\s+/i, "")
    .trim();

            console.log("CANTIDAD:", cantidad);
            console.log("UNIDAD:", unidadPedido);
            console.log("PRODUCTO:", nombreBuscado);

            
            const palabrasProducto = nombreBuscado
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .split(/\s+/)
                .filter(p => !["de", "del", "la", "el", "los", "las", "un", "una"].includes(p))
                .filter(Boolean);

            const condicionesProducto = palabrasProducto
                .map((_, i) => `
                    LOWER(
                        REGEXP_REPLACE(
                            p.nombre,
                            '\\s*\\([^)]*\\)',
                            '',
                            'g'
                        )
                    ) LIKE '%' || $${i + 1} || '%'
                `)
                .join(" AND ");

            const result = await this.pool.query(`
                SELECT
                    p.*,
                    pr.nombre AS proveedor_nombre,
                    u.nombre AS ubicacion_nombre
                FROM productos p
                LEFT JOIN proveedores pr
                    ON p.proveedor_id = pr.id
                LEFT JOIN ubicaciones u
                    ON p.ubicacion_id = u.id
                WHERE ${condicionesProducto}
                ORDER BY
                    CASE
                        WHEN LOWER(p.nombre) = LOWER($1)
                        THEN 0
                        ELSE 1
                    END,
                    p.nombre
                LIMIT 5
            `, palabrasProducto);
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
            `He encontrado varios productos parecidos:
${opciones}
Dime cuál quieres.`,
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
