const MotorPedidos = require("./MotorPedidos");
const NexoEngine = require("./nexoEngine");
const productoService = require("../services/productoService");

console.log("🔥 SANCHOCHAT.JS CARGADO");
class SanchoChat {

     constructor(pool) {
    this.pool = pool;
    this.motorPedidos = new MotorPedidos(pool);
    this.nexoEngine = new NexoEngine(pool);

    this.idInstancia =
        Math.random().toString(36).substring(2, 8);

    console.log(
        "🆔 SANCHO INSTANCIA CREADA:",
        this.idInstancia
    );

    // Producto pendiente de confirmación por el usuario
    this.confirmacionPendiente = null;

    // Pedidos pendientes de selección por el usuario
    this.seleccionPedidoPendiente = null;

    // Propuesta de pedidos automáticos pendiente de confirmación
    this.confirmacionPedidoAutomaticoPendiente = null;

    // Producción pendiente de selección por el usuario
    this.seleccionProduccionPendiente = null;

    // Producción pendiente de confirmación explícita del usuario
    this.confirmacionProduccionPendiente = null;

    // Merma pendiente de selección por el usuario
    this.seleccionMermaPendiente = null;

    // Merma real pendiente de confirmación explícita del usuario
    this.confirmacionMermaPendiente = null;
}

    async procesar(pregunta) {
        console.log("🔥 SANCHO PROCESAR RECIBE:", pregunta);
        const texto = String(pregunta || "").trim().toLowerCase();

        const normalizarUnidadProduccion = (unidad) => {
            if (!unidad) return null;

            const u = String(unidad)
                .trim()
                .toLowerCase()
                .replace(/[áàä]/g, "a")
                .replace(/[éèë]/g, "e")
                .replace(/[íìï]/g, "i")
                .replace(/[óòö]/g, "o")
                .replace(/[úùü]/g, "u");

            const equivalencias = {
                kg: "kg",
                kilo: "kg",
                kilos: "kg",
                kilogramo: "kg",
                kilogramos: "kg",

                g: "g",
                gr: "g",
                gramo: "g",
                gramos: "g",

                l: "l",
                litro: "l",
                litros: "l",

                ml: "ml",
                mililitro: "ml",
                mililitros: "ml",

                ud: "ud",
                uds: "ud",
                unidad: "ud",
                unidades: "ud",

                bolsa: "bolsa",
                bolsas: "bolsa",

                cubeta: "cubeta",
                cubetas: "cubeta"
            };

            return equivalencias[u] || u;
        };

        const convertirCantidadProduccion = (
            cantidad,
            unidadOrigen,
            unidadDestino
        ) => {
            const origen = normalizarUnidadProduccion(unidadOrigen);
            const destino = normalizarUnidadProduccion(unidadDestino);

            if (!origen || !destino || origen === destino) {
                return {
                    ok: true,
                    cantidad
                };
            }

            const conversiones = {
                "g->kg": cantidad / 1000,
                "kg->g": cantidad * 1000,
                "ml->l": cantidad / 1000,
                "l->ml": cantidad * 1000
            };

            const clave = `${origen}->${destino}`;

            if (Object.prototype.hasOwnProperty.call(conversiones, clave)) {
                return {
                    ok: true,
                    cantidad: conversiones[clave]
                };
            }

            return {
                ok: false
            };
        };

        console.log(
            "🧠 ESTADO RECEPCIÓN:",
            {
                confirmacionRecepcionPendiente:
                    this.confirmacionRecepcionPendiente,
                recepcionParcialPendiente:
                    this.recepcionParcialPendiente,
                texto
            }
        );


        // =========================================
        // SELECCIÓN DE ELABORACIÓN / PRODUCTO PENDIENTE
        // =========================================

        if (this.seleccionProduccionPendiente) {
            const pendiente = this.seleccionProduccionPendiente;

            const seleccion = texto.match(
                /^(?:la|el|opcion|opción|numero|número)?\s*(\d+)$/
            );

            let elaboracion = null;

            if (seleccion) {
                const valor = parseInt(seleccion[1], 10);

                elaboracion =
                    pendiente.elaboraciones.find(
                        (e) => Number(e.id) === valor
                    ) ||
                    pendiente.elaboraciones[valor - 1];
            } else {
                elaboracion = pendiente.elaboraciones.find(
                    (e) =>
                        String(e.nombre).trim().toLowerCase() === texto
                );
            }

            if (!elaboracion) {
                return {
                    respuesta:
                        "No identifico esa elaboración. Indica el número o el nombre completo de una de las opciones.",
                    accion: "SELECCIONAR_ELABORACION",
                    elaboraciones: pendiente.elaboraciones
                };
            }

            const conversion = convertirCantidadProduccion(
                pendiente.cantidad,
                pendiente.unidad,
                elaboracion.unidad_produccion
            );

            if (!conversion.ok) {
                return {
                    respuesta:
                        `No puedo convertir ${pendiente.unidad || "esa unidad"} a ${elaboracion.unidad_produccion || "la unidad de producción"} para ${elaboracion.nombre}.`,
                    accion: "PRODUCCION_RECHAZADA"
                };
            }

            const cantidadFinal = conversion.cantidad;

            this.seleccionProduccionPendiente = null;

            this.confirmacionProduccionPendiente = {
                cantidad: cantidadFinal,
                unidad: elaboracion.unidad_produccion,
                elaboracion
            };

            return {
                respuesta:
                    `Vas a producir ${cantidadFinal} ${elaboracion.unidad_produccion || ""} de ${elaboracion.nombre}, vinculada a la receta ${elaboracion.receta}. ¿Confirmas?`,
                accion: "CONFIRMAR_PRODUCCION",
                elaboracion,
                cantidad: cantidadFinal,
                unidad: elaboracion.unidad_produccion
            };
        }

        if (this.seleccionMermaPendiente) {
            const pendiente = this.seleccionMermaPendiente;

            const seleccion = texto.match(
                /^(?:la|el|opcion|opción|numero|número)?\s*(\d+)$/
            );

            let producto = null;

            if (seleccion) {
                const valor = parseInt(seleccion[1], 10);

                producto =
                    pendiente.productos.find(
                        (p) => Number(p.id) === valor
                    ) ||
                    pendiente.productos[valor - 1];
            } else {
                producto = pendiente.productos.find(
                    (p) =>
                        String(p.nombre).trim().toLowerCase() === texto
                );
            }

            if (!producto) {
                return {
                    respuesta:
                        "No identifico ese producto. Indica el número o el nombre completo de una de las opciones.",
                    accion: "SELECCIONAR_PRODUCTO_MERMA",
                    productos: pendiente.productos
                };
            }

            const cantidadLavorada = pendiente.cantidadLavorada;
            const cantidadMerma = pendiente.cantidadMerma;
            const lavorazione = pendiente.lavorazione;

            if (!cantidadLavorada) {
                this.seleccionMermaPendiente = null;

                return {
                    respuesta:
                        `Has seleccionado ${producto.nombre}. ¿Qué cantidad se trabajó?`,
                    accion: "MERMA_CANTIDAD_LAVORADA",
                    producto
                };
            }

            if (!lavorazione) {
                this.seleccionMermaPendiente = null;

                return {
                    respuesta:
                        `Has seleccionado ${producto.nombre}. ¿Qué lavorazione corresponde a esta merma?`,
                    accion: "MERMA_LAVORAZIONE",
                    producto
                };
            }

            if (cantidadMerma === null || cantidadMerma === undefined) {
                this.seleccionMermaPendiente = null;

                return {
                    respuesta:
                        `Has seleccionado ${producto.nombre}. ¿Qué cantidad de merma se produjo?`,
                    accion: "MERMA_CANTIDAD_MERMA",
                    producto
                };
            }

            const unidadProducto = producto.unidad || null;

            const unidadLavorado = parsearUnidad(
                pendiente.textoUnidadLavorado,
                unidadProducto
            );

            const unidadMerma = parsearUnidad(
                pendiente.textoUnidadMerma,
                unidadLavorado
            );

            if (!unidadLavorado) {
                this.seleccionMermaPendiente = null;

                return {
                    respuesta:
                        `No puedo determinar la unidad de la cantidad trabajada para ${producto.nombre}. Indícala explícitamente.`,
                    accion: "MERMA_UNIDAD_LAVORADA",
                    producto
                };
            }

            if (!unidadMerma) {
                this.seleccionMermaPendiente = null;

                return {
                    respuesta:
                        `No puedo determinar la unidad de la merma de ${producto.nombre}. Indícala explícitamente.`,
                    accion: "MERMA_UNIDAD_MERMA",
                    producto
                };
            }

            const datos = {
                producto_id: producto.id,
                lavorazione,
                cantidad_lavorada: cantidadLavorada,
                unidad: unidadLavorado,
                cantidad_merma: cantidadMerma,
                unidad_merma: unidadMerma,
                responsable: "Sancho"
            };

            this.seleccionMermaPendiente = null;

            this.confirmacionMermaPendiente = {
                producto,
                datos
            };

            return {
                respuesta:
                    `Has seleccionado ${producto.nombre}. Voy a registrar ${cantidadMerma} ${unidadMerma} de merma sobre ${cantidadLavorada} ${unidadLavorado} (lavorazione ${lavorazione}). ¿Confirmas?`,
                accion: "CONFIRMAR_MERMA",
                producto,
                datos
            };
        }

        // =========================================
        // CONFIRMAR PRODUCCIÓN PENDIENTE
        // =========================================

        if (this.confirmacionProduccionPendiente) {

            const afirmativo =
                /^(sí|si|correcto|vale|ok|okay|confirmo|adelante)$/i
                    .test(texto);

            const negativo =
                /^(no|cancelar|cancela|no quiero|anular|anula)$/i
                    .test(texto);

            const pendiente = this.confirmacionProduccionPendiente;

            if (negativo) {

                this.confirmacionProduccionPendiente = null;

                return {
                    respuesta:
                        `De acuerdo. He cancelado la producción de ${pendiente.cantidad} de ${pendiente.elaboracion.nombre}.`,
                    accion: "PRODUCCION_CANCELADA"
                };
            }

            if (!afirmativo) {
                return {
                    respuesta:
                        `Tengo pendiente producir ${pendiente.cantidad} de ${pendiente.elaboracion.nombre}. ¿Confirmas?`,
                    accion: "CONFIRMAR_PRODUCCION"
                };
            }

            this.confirmacionProduccionPendiente = null;

            try {

                const resultado = await this.nexoEngine.ejecutar(
                    "PRODUCIR",
                    {
                        elaboracionId: pendiente.elaboracion.id,
                        cantidad: pendiente.cantidad,
                        responsable: "Sancho"
                    }
                );

                return {
                    respuesta:
                        `Producción completada: ${pendiente.cantidad} de ${pendiente.elaboracion.nombre}.`,
                    accion: "PRODUCCION_COMPLETADA",
                    produccion: resultado.produccion,
                    elaboracion: resultado.elaboracion
                };

            } catch (error) {

                return {
                    respuesta:
                        `No puedo iniciar la producción de ${pendiente.elaboracion.nombre}: ${error.message}`,
                    accion: "PRODUCCION_RECHAZADA",
                    error: error.message
                };
            }
        }

        // =========================================
        // CONFIRMAR MERMA PENDIENTE
        // =========================================

        if (this.confirmacionMermaPendiente) {

            const afirmativo =
                /^(sí|si|correcto|vale|ok|okay|confirmo|adelante)$/i
                    .test(texto);

            const negativo =
                /^(no|cancelar|cancela|no quiero|anular|anula)$/i
                    .test(texto);

            const pendiente = this.confirmacionMermaPendiente;

            if (negativo) {

                this.confirmacionMermaPendiente = null;

                return {
                    respuesta:
                        `De acuerdo. He cancelado el registro de merma de ${pendiente.datos.cantidad_merma} ${pendiente.datos.unidad} en ${pendiente.producto.nombre}.`,
                    accion: "MERMA_CANCELADA"
                };
            }

            if (!afirmativo) {
                return {
                    respuesta:
                        `Tengo pendiente registrar una merma de ${pendiente.datos.cantidad_merma} ${pendiente.datos.unidad} en ${pendiente.producto.nombre} (lavorazione ${pendiente.datos.lavorazione}). ¿Confirmas?`,
                    accion: "CONFIRMAR_MERMA"
                };
            }

            this.confirmacionMermaPendiente = null;

            try {

                const resultado = await this.nexoEngine.ejecutar(
                    "REGISTRAR_MERMA",
                    pendiente.datos
                );

                return {
                    respuesta:
                        `Merma registrada: ${resultado.cantidad_merma} ${resultado.unidad} sobre ${resultado.cantidad_lavorada} ${resultado.unidad} de ${pendiente.producto.nombre} (${resultado.lavorazione}). Merma ${resultado.porcentaje_merma}% · neto ${resultado.cantidad_neta} ${resultado.unidad}.`,
                    accion: "MERMA_COMPLETADA",
                    merma: resultado
                };

            } catch (error) {

                return {
                    respuesta:
                        `No puedo registrar la merma de ${pendiente.producto.nombre}: ${error.message}`,
                    accion: "MERMA_RECHAZADA",
                    error: error.message
                };
            }
        }

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
        // CONFIRMAR PEDIDOS AUTOMÁTICOS
        // =========================================

        if (this.confirmacionPedidoAutomaticoPendiente) {

            const afirmativo =
                /^(sí|si|correcto|vale|ok|okay|confirmo|adelante)$/i
                    .test(texto.trim());

            const negativo =
                /^(no|cancelar|cancela|no quiero|anular|anula)$/i
                    .test(texto.trim());

            if (afirmativo) {

                const propuestas =
                    this.confirmacionPedidoAutomaticoPendiente;

                const pedidosGenerados =
                    await this.motorPedidos.generarPedidosAutomaticos();

                this.confirmacionPedidoAutomaticoPendiente = null;

                if (!pedidosGenerados.length) {

                    return {
                        respuesta:
                            "No se ha generado ningún pedido automático.",
                        accion:
                            "PEDIDOS_AUTOMATICOS"
                    };
                }

                return {
                    respuesta:
                        `Perfecto. He generado ${pedidosGenerados.length} pedido${pedidosGenerados.length === 1 ? "" : "s"} automático${pedidosGenerados.length === 1 ? "" : "s"}: ${pedidosGenerados.join(", ")}.`,
                    accion:
                        "PEDIDOS_AUTOMATICOS",
                    pedidos:
                        pedidosGenerados,
                    propuestas
                };
            }

            if (negativo) {

                this.confirmacionPedidoAutomaticoPendiente = null;

                return {
                    respuesta:
                        "De acuerdo. He cancelado la generación de los pedidos. No se ha modificado nada.",
                    accion:
                        "PEDIDOS_AUTOMATICOS_CANCELADOS"
                };
            }
        }

        // =========================================
        // PROPUESTA DE PEDIDOS AUTOMÁTICOS
        // =========================================

        if (
            texto.includes("genera los pedidos") ||
            texto.includes("generar los pedidos") ||
            texto.includes("prepara los pedidos") ||
            texto.includes("preparar los pedidos") ||
            texto.includes("genera pedidos") ||
            texto.includes("generar pedidos") ||
            texto.includes("prepara pedidos") ||
            texto.includes("preparar pedidos")
        ) {

            const propuestas =
                await this.motorPedidos.previsualizarPedidosAutomaticos();

            if (!propuestas.length) {

                return {
                    respuesta:
                        "No hay pedidos automáticos que preparar hoy.",
                    accion:
                        "CONSULTAR_PEDIDOS"
                };
            }

            this.confirmacionPedidoAutomaticoPendiente =
                propuestas;

            const grupos = {};

            for (const propuesta of propuestas) {

                if (!grupos[propuesta.proveedor]) {
                    grupos[propuesta.proveedor] = [];
                }

                grupos[propuesta.proveedor].push(
                    `- ${propuesta.producto}: ${propuesta.descripcion_cantidad}`
                );
            }

            let respuesta =
                "He preparado la propuesta de pedidos para hoy:\n";

            for (const proveedor of Object.keys(grupos)) {

                respuesta += `\n${proveedor}:\n`;

                for (const producto of grupos[proveedor]) {
                    respuesta += `${producto}\n`;
                }
            }

            respuesta +=
                "\n¿Quieres que genere estos pedidos?";

            return {
                respuesta,
                accion:
                    "CONFIRMAR_PEDIDOS_AUTOMATICOS",
                propuestas
            };
        }

        // =========================================
        // CONFIRMAR RECEPCIÓN PENDIENTE
        // =========================================

        if (this.confirmacionRecepcionPendiente) {

            const confirmacion =
                this.confirmacionRecepcionPendiente;

            const afirmativo =
                /^(sí|si|correcto|vale|ok|okay|han llegado todos|ha llegado todo)$/i
                    .test(texto.trim());

            if (afirmativo) {

                this.confirmacionRecepcionPendiente = null;

                const pedidosService =
                    require("../services/pedidosService");

                const resultado =
                    await pedidosService.recibirPedido(
                        this.pool,
                        confirmacion.pedidoId
                    );

                return {
                    respuesta:
                        `Perfecto. He registrado la recepción completa del pedido de ${confirmacion.proveedor}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`,

                    accion:
                        "RECIBIR_PEDIDO",

                    pedido:
                        resultado,

                    proveedor:
                        confirmacion.proveedor
                };
            }
        }

        // =========================================
        // NEGATIVO_RECEPCION_PENDIENTE
        // =========================================

        if (this.confirmacionRecepcionPendiente) {

            const confirmacion =
                this.confirmacionRecepcionPendiente;

            const negativo =
                /^(no|no han llegado todos|no ha llegado todo|todavía no|aún no)$/i
                    .test(texto.trim());

            if (negativo) {

                this.confirmacionRecepcionPendiente =
                    null;

                this.recepcionParcialPendiente = {
                    pedidoId:
                        confirmacion.pedidoId,

                    detalleId:
                        confirmacion.detalleId,

                    cantidadPendiente:
                        confirmacion.cantidad,

                    producto:
                        confirmacion.producto,

                    formato:
                        confirmacion.formato,

                    proveedor:
                        confirmacion.proveedor
                };

                return {
                    respuesta:
                        `De acuerdo. ¿Cuántos ${confirmacion.formato || "UDS"} de ${confirmacion.producto} han llegado?`,

                    accion:
                        "INDICAR_CANTIDAD_RECEPCION",

                    pedido:
                        confirmacion.pedidoId,

                    detalle:
                        confirmacion.detalleId,

                    producto:
                        confirmacion.producto,

                    formato:

                        confirmacion.formato
                };
            }
        }

        // =========================================
        // RECEPCIÓN PARCIAL DIRECTA POR VOZ
        // =========================================

        const patronRecepcionParcial =
            texto.match(
                /^(?:han\s+llegado|ha\s+llegado|llegaron|recibimos)\s+(\d+(?:[.,]\d+)?)\s+(cajas?|paquetes?|unidades?|uds?|botellas?|botes?|piezas?)(?:\s+(?:de\s+)?(.+))?$/i
            );



        if (patronRecepcionParcial) {


            const cantidadRecibida =
                Number(
                    patronRecepcionParcial[1]
                        .replace(",", ".")
                );

            const unidad =
                patronRecepcionParcial[2]
                    .toLowerCase()
                    .replace(/s$/, "");

            let productoBuscado =
    (patronRecepcionParcial[3] || "")
        .replace(/[?.!,¿¡]/g, "")
        .trim()
        .toLowerCase();

// Detectar pedido indicado explícitamente
const pedidoExplicito =
    productoBuscado.match(
        /\s+(?:del\s+)?pedido\s+(?:n[uú]mero\s+)?(\d+)\s*$/i
    );

let numeroPedidoExplicito = null;

if (pedidoExplicito) {

    numeroPedidoExplicito =
        Number(pedidoExplicito[1]);

    productoBuscado =
        productoBuscado
            .replace(pedidoExplicito[0], "")
            .trim();

    console.log(
        "📦 SANCHO PEDIDO EXPLÍCITO:",
        numeroPedidoExplicito
    );
}

            console.log(
                "📦 SANCHO RECEPCIÓN PARCIAL DIRECTA:",
                cantidadRecibida,
                unidad,
                productoBuscado
            );

            const pedidosResult =
                await this.pool.query(
                    `
                    SELECT
                        p.id,
                        p.proveedor,
                        p.proveedor_id,
                        p.estado
                    FROM pedidos p
                    WHERE
                        p.estado = 'Pendiente'
                    ORDER BY
                        p.id DESC
                    `
                );

            const candidatos = [];
            const candidatosNormalizados = [];

            for (const pedido of pedidosResult.rows) {

                const detalleResult =
                    await this.pool.query(
                        `
                        SELECT
                            id,
                            producto,
                            cantidad,
                            formato,
                            cantidad_recibida
                        FROM pedido_detalle
                        WHERE pedido_id = $1
                          AND cantidad_recibida < cantidad
                        `,
                        [pedido.id]
                    );

                for (const detalle of detalleResult.rows) {

                    const nombreProducto =
                        String(detalle.producto || "")
                            .toLowerCase();

                    const textoProductoPalabras =
                        productoBuscado
                            .split(/\s+/)
                            .filter(p => p.length >= 4);

                    const palabrasNormalizadas =
                        textoProductoPalabras
                            .map(p => p.replace(/s$/, ""));

                    const palabrasProducto =
                        nombreProducto
                            .split(/\s+/)
                            .filter(p => p.length >= 4);

                    const coincideProductoExacto =
                        productoBuscado === "" ||
                        textoProductoPalabras.some(palabra =>
                            palabrasProducto.includes(palabra)
                        );

                    const coincideProductoNormalizado =
                        productoBuscado !== "" &&
                        palabrasNormalizadas.some(palabra =>
                            palabrasProducto.some(
                                palabraProducto =>
                                    palabraProducto.replace(/s$/, "") === palabra
                            )
                        );

                    const formato =
                        String(detalle.formato || "")
                            .toLowerCase();

                  const coincideUnidad =
    !unidad ||
    (
        productoBuscado !== "" &&
        !formato
    ) ||
    formato === unidad ||
    (unidad === "ud" && formato === "unidad") ||
    (unidad === "unidad" && formato === "ud");

                   if (
    coincideUnidad &&
    (
        numeroPedidoExplicito === null ||
        Number(pedido.id) === numeroPedidoExplicito
    )
) {
    if (coincideProductoExacto) {
        candidatos.push({
            pedido,
            detalle
        });
    } else if (coincideProductoNormalizado) {
        candidatosNormalizados.push({
            pedido,
            detalle
        });
    }
}
                }
            }

            // Si existe una coincidencia exacta,
            // ignorar las coincidencias solo normalizadas.
            if (candidatos.length === 0) {
                candidatos.push(...candidatosNormalizados);
            }


// -----------------------------------------
// PRIORIDAD: PEDIDO INDICADO EXPLÍCITAMENTE
// -----------------------------------------

const numeroPedidoTexto =
    texto.match(
        /(?:pedido\s+(?:n[uú]mero\s+)?|n[uú]mero\s+)(\d+)/i
    );

if (numeroPedidoTexto) {

    const numeroPedido =
        Number(numeroPedidoTexto[1]);

    const candidatosPedido =
        candidatos.filter(
            c =>
                Number(c.pedido.id) === numeroPedido
        );

    if (candidatosPedido.length > 0) {

        candidatos.splice(
            0,
            candidatos.length,
            ...candidatosPedido
        );

        console.log(
            "📦 SANCHO PEDIDO EXPLÍCITO:",
            numeroPedido,
            "DETALLES:",
            candidatosPedido.length
        );
    }
}


                       // -----------------------------------------
            // AGRUPAR CANDIDATOS POR PEDIDO
            // -----------------------------------------

            const pedidosMap =
                new Map();

            for (const candidato of candidatos) {

                const pedidoId =
                    Number(candidato.pedido.id);

                if (!pedidosMap.has(pedidoId)) {

                    pedidosMap.set(
                        pedidoId,
                        {
                            id:
                                candidato.pedido.id,

                            proveedor:
                                candidato.pedido.proveedor,

                            detalle:
                                []
                        }
                    );
                }

                pedidosMap
                    .get(pedidoId)
                    .detalle
                    .push(candidato.detalle);
            }

            const pedidosUnicos =
                Array.from(
                    pedidosMap.values()
                );


            // -----------------------------------------
            // UN SOLO PEDIDO
            // -----------------------------------------

            if (pedidosUnicos.length === 1) {

                const pedido =
                    pedidosUnicos[0];

                // -----------------------------------------
                // UN SOLO PRODUCTO
                // -----------------------------------------

                if (pedido.detalle.length === 1) {

                    const detalle =
                        pedido.detalle[0];

                    console.log(
                        "📦 SANCHO PEDIDO ENCONTRADO:",
                        pedido.id,
                        detalle.producto
                    );

                    const pedidosService =
                        require("../services/pedidosService");

                    const recepciones = [
                        {
                            detalle_id:
                                detalle.id,

                            cantidad:
                                cantidadRecibida
                        }
                    ];

                    const resultado =
                        await pedidosService.recibirPedido(
                            this.pool,
                            pedido.id,
                            recepciones
                        );

                    return {
                        respuesta:
                            `Perfecto. He registrado la recepción de ${cantidadRecibida} ${unidad}${cantidadRecibida !== 1 ? "s" : ""} de ${detalle.producto}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`,

                        accion:
                            "RECIBIR_PEDIDO",

                        pedido:
                            resultado,

                        proveedor:
                            pedido.proveedor,

                        recepciones
                    };
                }


                // -----------------------------------------
                // UN PEDIDO PERO VARIOS PRODUCTOS
                // -----------------------------------------

                this.seleccionPedidoPendiente = {

                    proveedor:
                        pedido.proveedor,

                    pedidos: [
                        pedido
                    ],

                    recepcionDirecta: {

                        cantidad:
                            cantidadRecibida,

                        unidad:
                            unidad,

                        producto:
                            productoBuscado
                    }
                };

                return {
                    respuesta:
                        `He encontrado varios productos pendientes en el pedido ${pedido.id}. ¿Cuál ha llegado?`,

                    accion:
                        "SELECCIONAR_PRODUCTO_RECEPCION",

                    pedido:
                        pedido.id,

                    productos:
                        pedido.detalle.map(
                            detalle => ({
                                id:
                                    detalle.id,

                                producto:
                                    detalle.producto,

                                cantidad:
                                    detalle.cantidad,

                                formato:
                                    detalle.formato
                            })
                        )
                };
            }


            // -----------------------------------------
            // VARIOS PEDIDOS
            // -----------------------------------------

            if (pedidosUnicos.length > 1) {

                const pedidosSeleccion =
                    pedidosUnicos.map(
                        pedido => ({
                            ...pedido,

                            producto:
                                pedido.detalle[0]?.producto ||
                                null,

                            cantidad:
                                pedido.detalle[0]?.cantidad ||
                                null,

                            formato:
                                pedido.detalle[0]?.formato ||
                                null
                        })
                    );


                this.seleccionPedidoPendiente = {

                    proveedor:
                        candidatos[0].pedido.proveedor,

                    pedidos:
                        pedidosSeleccion,

                    recepcionDirecta: {

                        cantidad:
                            cantidadRecibida,

                        unidad:
                            unidad,

                        producto:
                            productoBuscado
                    }
                };

                return {
                    respuesta:
                        productoBuscado
                            ? `He encontrado varios pedidos pendientes con ${productoBuscado}. Necesito que me indiques cuál ha llegado.`
                            : `He encontrado varios pedidos pendientes. Necesito que me indiques cuál ha llegado.`,

                    accion:
                        "SELECCIONAR_PEDIDO",

                    pedidos:
                        pedidosSeleccion
                };
            }
            }
        // =========================================
        // RECEPCIÓN SIN CANTIDAD
        // =========================================

        const patronRecepcionSinCantidad =
            texto.match(
                /^(?:han\s+llegado|ha\s+llegado|llegaron|recibimos)\s+(?:las?|los?)\s+(.+)$/i
            );

        if (patronRecepcionSinCantidad) {

            const productoBuscado =
                patronRecepcionSinCantidad[1]
                    .replace(/[?.!,¿¡]/g, "")
                    .trim()
                    .toLowerCase();

            console.log(
                "📦 SANCHO RECEPCIÓN SIN CANTIDAD:",
                productoBuscado
            );

            const pedidosResult =
                await this.pool.query(`
                    SELECT
                        p.id,
                        p.proveedor,
                        p.proveedor_id,
                        p.estado
                    FROM pedidos p
                    WHERE p.estado = 'Pendiente'
                    ORDER BY p.id DESC
                `);

            const candidatos = [];
            console.log(
    "🔎 PEDIDOS PENDIENTES ENCONTRADOS:",
    pedidosResult.rows.length
);

            for (const pedido of pedidosResult.rows) {

                const detalleResult =
                    await this.pool.query(`
                        SELECT
                            id,
                            producto,
                            cantidad,
                            formato,
                            cantidad_recibida
                        FROM pedido_detalle
                        WHERE pedido_id = $1
                          AND cantidad_recibida < cantidad
                    `, [pedido.id]);

                console.log(
                    "🔎 DETALLES PEDIDO:",
                    pedido.id,
                    detalleResult.rows.length
                );

                for (const detalle of detalleResult.rows) {

                    const nombreProducto =
                        String(detalle.producto || "")
                            .toLowerCase();

                    const palabras =
                        productoBuscado
                            .split(/\s+/)
                            .filter(p => p.length >= 4);

                    const coincideProducto =
                        palabras.some(palabra =>
                            nombreProducto.includes(palabra)
                        );

                    if (coincideProducto) {
                        candidatos.push({
                            pedido,
                            detalle
                        });
                    }
                }
            }

                if (candidatos.length === 1) {

                const candidato = candidatos[0];

                const cantidadPendiente =
                    Number(candidato.detalle.cantidad) -
                    Number(candidato.detalle.cantidad_recibida);

                this.confirmacionRecepcionPendiente = {
                    pedidoId:
                        candidato.pedido.id,

                    detalleId:
                        candidato.detalle.id,

                    cantidad:
                        cantidadPendiente,

                    producto:
                        candidato.detalle.producto,

                    formato:
                        candidato.detalle.formato,

                    proveedor:
                        candidato.pedido.proveedor
                };

                console.log(
                    "✅ CONFIRMACIÓN GUARDADA:",
                    this.confirmacionRecepcionPendiente
                );

                return {
                    respuesta:
                        `Tengo pendiente recibir ${cantidadPendiente} ${candidato.detalle.formato || "UDS"} de ${candidato.detalle.producto}. ¿Han llegado todos?`,

                    accion:
                        "CONFIRMAR_RECEPCION",

                    pedido:
                        candidato.pedido.id,

                    detalle:
                        candidato.detalle.id,

                    cantidad_pendiente:
                        cantidadPendiente,

                    formato:
                        candidato.detalle.formato,

                    producto:
                        candidato.detalle.producto
                };
            }

            if (candidatos.length > 1) {

                const pedidosSeleccion =
                    candidatos.map(c => ({
                        id:
                            c.pedido.id,

                        proveedor:
                            c.pedido.proveedor,

                        producto:
                            c.detalle.producto,

                        cantidad:
                            c.detalle.cantidad,

                        formato:
                            c.detalle.formato,

                        detalle:
                            [c.detalle]
                    }));

                this.seleccionPedidoPendiente = {
                    proveedor:
                        candidatos[0].pedido.proveedor,

                    pedidos:
                        pedidosSeleccion
                };

                console.log(
                    "✅ SELECCIÓN DE PEDIDO GUARDADA:",
                    this.seleccionPedidoPendiente
                );

                return {
                    respuesta:
                        `He encontrado varios pedidos pendientes con ${productoBuscado}. Necesito que me indiques cuál ha llegado.`,

                    accion:
                        "SELECCIONAR_PEDIDO",

                    pedidos:
                        this.seleccionPedidoPendiente.pedidos
                };
            }

            return {
                respuesta:
                    `No he encontrado ningún pedido pendiente con ${productoBuscado}.`,

                accion:
                    "PEDIDO_NO_ENCONTRADO"
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

// -----------------------------------------
// ELIMINAR PEDIDOS VACÍOS
// -----------------------------------------

this.seleccionPedidoPendiente.pedidos =
    this.seleccionPedidoPendiente.pedidos
        .filter(p => p.detalle && p.detalle.length > 0);

// -----------------------------------------
// SI NO QUEDA NINGÚN PEDIDO REAL
// -----------------------------------------

if (
    this.seleccionPedidoPendiente.pedidos.length === 0
) {

    this.seleccionPedidoPendiente = null;

    return {

        respuesta:
            `No hay ningún pedido con productos pendientes de recibir de ${proveedor.nombre}.`,

        accion:
            "PEDIDO_NO_ENCONTRADO",

        proveedor:
            proveedor.nombre
    };
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
    texto.match(/^(?:(?:pedido\s+(?:n[uú]mero\s+)?|n[uú]mero\s+))?(\d+)$/i);
            if (numero) {

                const numeroPedido =
                    Number(numero[1]);

                // Primero: interpretar el número como ID real del pedido
                pedidoSeleccionado =
                    seleccion.pedidos.find(
                        pedido =>
                            Number(pedido.id) === numeroPedido
                    );

                // Compatibilidad: si no coincide con un ID,
                // interpretar el número como posición
                if (!pedidoSeleccionado) {

                    const indice =
                        numeroPedido - 1;

                    if (
                        indice >= 0 &&
                        indice < seleccion.pedidos.length
                    ) {
                        pedidoSeleccionado =
                            seleccion.pedidos[indice];
                    }
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

                        const textoPalabras =
                            texto
                                .toLowerCase()
                                .replace(/[?.!,¿¡]/g, "")
                                .split(/\s+/)
                                .filter(p => p.length >= 4);

                        const coincideExacto =
                            palabras.some(palabra =>
                                textoPalabras.includes(palabra)
                            );

                        const coincideNormalizado =
                            palabras.some(palabra => {
                                const palabraNormalizada =
                                    palabra.replace(/s$/, "");

                                return textoPalabras.some(
                                    textoPalabra =>
                                        textoPalabra.replace(/s$/, "") ===
                                        palabraNormalizada
                                );
                            });

                        const coincide =
                            coincideExacto || coincideNormalizado;

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
                // SELECCIÓN DE PRODUCTO PARA RECEPCIÓN PARCIAL
                // -----------------------------------------
                // Si ya existe una recepción parcial pendiente
                // y el pedido tiene varios detalles, identificar
                // exactamente qué producto ha llegado.

                let detalleSeleccionadoPorProducto = null;

                if (
                    seleccion.recepcionDirecta &&
                    pedidoSeleccionado.detalle &&
                    pedidoSeleccionado.detalle.length > 1
                ) {

                    const textoProducto =
                        texto
                            .toLowerCase()
                            .replace(/[?.!,¿¡]/g, "")
                            .trim();

                    const coincidenciasExactas = [];
                    const coincidenciasNormalizadas = [];

                    const textoPalabras =
                        textoProducto
                            .split(/\s+/)
                            .filter(p => p.length >= 4);

                    for (const detalle of pedidoSeleccionado.detalle) {

                        const producto =
                            String(detalle.producto || "")
                                .toLowerCase();

                        const palabrasExactas =
                            producto
                                .split(/\s+/)
                                .filter(p => p.length >= 4);

                        const palabrasNormalizadas =
                            palabrasExactas
                                .map(p => p.replace(/s$/, ""));

                        const coincideExacta =
                            palabrasExactas.some(palabra =>
                                textoPalabras.includes(palabra)
                            );

                        const coincideNormalizada =
                            palabrasNormalizadas.some(palabra =>
                                textoPalabras.some(
                                    textoPalabra =>
                                        textoPalabra.replace(/s$/, "") === palabra
                                )
                            );

                        if (coincideExacta) {
                            coincidenciasExactas.push(detalle);
                        } else if (coincideNormalizada) {
                            coincidenciasNormalizadas.push(detalle);
                        }
                    }

                    const coincidenciasProducto =
                        coincidenciasExactas.length > 0
                            ? coincidenciasExactas
                            : coincidenciasNormalizadas;

                    if (coincidenciasProducto.length === 1) {

                        detalleSeleccionadoPorProducto =
                            coincidenciasProducto[0];

                        console.log(
                            "✅ SANCHO DETALLE SELECCIONADO:",
                            detalleSeleccionadoPorProducto.id,
                            detalleSeleccionadoPorProducto.producto
                        );
                    }

                    if (coincidenciasProducto.length > 1) {

                        return {
                            respuesta:
                                `He encontrado varios productos que coinciden. ¿Cuál ha llegado?`,
                            accion:
                                "SELECCIONAR_PRODUCTO_RECEPCION",
                            pedido:
                                pedidoSeleccionado.id,
                            productos:
                                coincidenciasProducto.map(detalle => ({
                                    id:
                                        detalle.id,
                                    producto:
                                        detalle.producto,
                                    cantidad:
                                        detalle.cantidad,
                                    formato:
                                        detalle.formato
                                }))
                        };
                    }

                    if (
                        coincidenciasProducto.length === 0 &&
                        pedidoSeleccionado.detalle.length > 1
                    ) {

                        return {
                            respuesta:
                                `El pedido ${pedidoSeleccionado.id} tiene varios productos. Indícame cuál ha llegado.`,
                            accion:
                                "SELECCIONAR_PRODUCTO_RECEPCION",
                            pedido:
                                pedidoSeleccionado.id,
                            productos:
                                pedidoSeleccionado.detalle.map(detalle => ({
                                    id:
                                        detalle.id,
                                    producto:
                                        detalle.producto,
                                    cantidad:
                                        detalle.cantidad,
                                    formato:
                                        detalle.formato
                                }))
                        };
                    }
                }
            // -----------------------------------------
            // PEDIDO ENCONTRADO
            // -----------------------------------------

            if (pedidoSeleccionado) {

                // -----------------------------------------
                // RECEPCIÓN SIN CANTIDAD:
                // pedir confirmación antes de recibir todo
                // -----------------------------------------

                if (!seleccion.recepcionDirecta) {

                    const detalleResult =
                        await this.pool.query(
                            `
                            SELECT
                                id,
                                producto,
                                cantidad,
                                formato,
                                cantidad_recibida
                            FROM pedido_detalle
                            WHERE pedido_id = $1
                              AND cantidad_recibida < cantidad
                            ORDER BY producto
                            `,
                            [pedidoSeleccionado.id]
                        );

                    if (detalleResult.rows.length > 0) {

                        const detalle =
                            detalleResult.rows[0];

                        const cantidadPendiente =
                            Number(detalle.cantidad) -
                            Number(detalle.cantidad_recibida);

                        this.confirmacionRecepcionPendiente = {
                            pedidoId:
                                pedidoSeleccionado.id,

                            detalleId:
                                detalle.id,

                            cantidad:
                                cantidadPendiente,

                            producto:
                                detalle.producto,

                            formato:
                                detalle.formato,

                            proveedor:
                                pedidoSeleccionado.proveedor
                        };

                           console.log(
                           "✅ CONFIRMACIÓN GUARDADA:",
                           this.confirmacionRecepcionPendiente
                        );

                        this.seleccionPedidoPendiente = null;

                        return {
                            respuesta:
                                `El pedido ${pedidoSeleccionado.id} tiene pendientes ${cantidadPendiente} ${detalle.formato || "UDS"} de ${detalle.producto}. ¿Han llegado todos?`,

                            accion:
                                "CONFIRMAR_RECEPCION",

                            pedido:
                                pedidoSeleccionado.id,

                            detalle:
                                detalle.id,

                            cantidad_pendiente:
                                cantidadPendiente,

                            formato:
                                detalle.formato,

                            producto:
                                detalle.producto
                        };
                    }
                }

                this.seleccionPedidoPendiente = null;

                const pedidosService =
                    require("../services/pedidosService");

                // -----------------------------------------
                // DETECTAR RECEPCIÓN PARCIAL POR VOZ
                // -----------------------------------------
let recepciones = null;

// -----------------------------------------
// DETECTAR RECEPCIÓN PARCIAL POR VOZ
// -----------------------------------------

const recepcionDirecta =
    seleccion.recepcionDirecta || null;

let cantidadSolicitada = null;
let unidad = null;

// -----------------------------------------
// USAR RECEPCIÓN ORIGINAL GUARDADA
// -----------------------------------------

if (recepcionDirecta) {

    cantidadSolicitada =
        Number(recepcionDirecta.cantidad);

    unidad =
        String(recepcionDirecta.unidad || "")
            .toLowerCase()
            .replace(/s$/, "");
}

// -----------------------------------------
// DETECTAR RECEPCIÓN ESCRITA DIRECTAMENTE
// -----------------------------------------

if (!recepcionDirecta) {

    const patronCantidad =
        texto.match(
            /(?:han\s+llegado|ha\s+llegado|recibimos|recibido|llegaron)\s+(\d+(?:[.,]\d+)?)\s+(?:cajas?|paquetes?|unidades?|uds?|botellas?|botes?|piezas?)/i
        );

    if (patronCantidad) {

        cantidadSolicitada =
            Number(
                patronCantidad[1]
                    .replace(",", ".")
            );

        const unidadTexto =
            texto.match(
                /\d+(?:[.,]\d+)?\s+(cajas?|paquetes?|unidades?|uds?|botellas?|botes?|piezas?)/i
            );

        unidad =
            unidadTexto
                ? unidadTexto[1]
                    .toLowerCase()
                    .replace(/s$/, "")
                : null;
    }
}

// -----------------------------------------
// CONSTRUIR RECEPCIÓN
// -----------------------------------------

if (
    cantidadSolicitada !== null &&
    pedidoSeleccionado.detalle
) {

   let detalleSeleccionado =
    detalleSeleccionadoPorProducto || null;

    // Se Sancho ha già identificato esattamente il prodotto,
    // NON sovrascrivere la selezione usando solo il formato.
    if (!detalleSeleccionado) {

        for (const detalle of pedidoSeleccionado.detalle) {

            const formato =
                String(detalle.formato || "")
                    .toLowerCase();

            if (
                unidad &&
                (
                    formato === unidad ||
                    (unidad === "unidad" && formato === "ud") ||
                    (unidad === "ud" && formato === "unidad")
                )
            ) {

                detalleSeleccionado =
                    detalle;

                break;
            }
        }
    }

    // Si solo hay una línea, la usamos directamente
    if (
        !detalleSeleccionado &&
        pedidoSeleccionado.detalle.length === 1
    ) {

        detalleSeleccionado =
            pedidoSeleccionado.detalle[0];
    }

    if (detalleSeleccionado) {

        recepciones = [
            {
                detalle_id:
                    detalleSeleccionado.id,

                cantidad:
                    cantidadSolicitada
            }
        ];
    }
}

                console.log(
                    "🔎 DEBUG RECEPCIÓN FINAL:",
                    JSON.stringify({
                        pedidoId: pedidoSeleccionado.id,
                        recepciones,
                        detalleSeleccionadoPorProducto:
                            detalleSeleccionadoPorProducto
                                ? {
                                    id: detalleSeleccionadoPorProducto.id,
                                    producto: detalleSeleccionadoPorProducto.producto
                                }
                                : null
                    })
                );

                const resultado =
                    await pedidosService.recibirPedido(
                        this.pool,
                        pedidoSeleccionado.id,
                        recepciones
                    );

                return {
                    respuesta:
                        recepciones
                            ? `Perfecto. He registrado la recepción parcial del pedido de ${seleccion.proveedor}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`
                            : `Perfecto. He registrado la recepción completa del pedido de ${seleccion.proveedor}. El pedido queda en estado ${resultado.estado.toLowerCase()}.`,

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

        // =========================================
        // PROPONER PRODUCCIÓN
        // =========================================

        const patronProduccion = texto.match(
            /^(?:produce|producir|prepara|preparar|haz|hacer)\s+(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilos|kilogramo|kilogramos|g|gr|gramo|gramos|l|litro|litros|ml|mililitro|mililitros|bolsas?|cubetas?|unidades?|uds?|ud)?\s+(?:de\s+)?(.+)$/i
        );

        if (patronProduccion) {

            const cantidad = Number(
                patronProduccion[1].replace(",", ".")
            );

            const unidadSolicitada = normalizarUnidadProduccion(
                patronProduccion[2]
            );

            const nombreBuscado = patronProduccion[3]
                .replace(/\bpor favor\b/gi, "")
                .replace(/^(el|la|los|las|un|una)\s+/i, "")
                .trim();

            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                return {
                    respuesta: "La cantidad a producir debe ser mayor que cero.",
                    accion: "PRODUCCION_RECHAZADA"
                };
            }

            const elaboraciones = await this.pool.query(
                `
                SELECT
                    e.id,
                    e.nombre,
                    r.nombre AS receta,
                    COALESCE(e.unidad, r.unidad_produccion) AS unidad_produccion
                FROM elaboraciones e
                JOIN recetas r
                    ON r.id = e.receta_id
                WHERE e.activa IS DISTINCT FROM FALSE
                    AND LOWER(e.nombre) LIKE LOWER($1)
                ORDER BY e.nombre
                LIMIT 5
                `,
                [`%${nombreBuscado}%`]
            );

            if (elaboraciones.rows.length === 0) {
                return {
                    respuesta:
                        `No encuentro una elaboración vinculada a una receta con el nombre "${nombreBuscado}".`,
                    accion: "ELABORACION_NO_ENCONTRADA"
                };
            }

            if (elaboraciones.rows.length > 1) {
                const opciones = elaboraciones.rows
                    .map((elaboracion, indice) => `${indice + 1}. ${elaboracion.nombre}`)
                    .join(", ");

                this.seleccionProduccionPendiente = {
                    cantidad,
                    unidad: unidadSolicitada,
                    elaboraciones: elaboraciones.rows
                };

                return {
                    respuesta:
                        `He encontrado varias elaboraciones: ${opciones}. Indica el número o el nombre completo de una de ellas.`,
                    accion: "SELECCIONAR_ELABORACION",
                    elaboraciones: elaboraciones.rows
                };
            }

            const elaboracion = elaboraciones.rows[0];

            const conversion = convertirCantidadProduccion(
                cantidad,
                unidadSolicitada,
                elaboracion.unidad_produccion
            );

            if (!conversion.ok) {
                return {
                    respuesta:
                        `No puedo convertir ${unidadSolicitada || "esa unidad"} a ${elaboracion.unidad_produccion || "la unidad de producción"} para ${elaboracion.nombre}.`,
                    accion: "PRODUCCION_RECHAZADA"
                };
            }

            const cantidadFinal = conversion.cantidad;

            this.confirmacionProduccionPendiente = {
                cantidad: cantidadFinal,
                unidad: elaboracion.unidad_produccion,
                elaboracion
            };

            return {
                respuesta:
                    `Vas a producir ${cantidadFinal} ${elaboracion.unidad_produccion || ""} de ${elaboracion.nombre}, vinculada a la receta ${elaboracion.receta}. ¿Confirmas?`,
                accion: "CONFIRMAR_PRODUCCION",
                elaboracion,
                cantidad: cantidadFinal,
                unidad: elaboracion.unidad_produccion
            };
        }
// =========================================
        // PROPONER REGISTRO DE MERMA (MODULO MERME)

        // =========================================
        // Ej: "he trabajado 3 kg de tomate, he quitado 95 g de merma,
        //      lavorazione mondatura"

        if (/\bmerma\b/i.test(texto)) {
    console.log("🔥 SANCHO: ENTRA EN BLOQUE MERMA", texto);

    // -----------------------------------------
    // ESTADISTICAS DE MERMA (consulta)
    // -----------------------------------------

// -----------------------------------------
            // ESTADISTICAS DE MERMA (consulta)
            // -----------------------------------------

            if (
                /\b(estadistic|estad[ií]stica|acumulad|resumen|porcentaje|historial|cu[aá]nta merma|llevamos)\b/i
                    .test(texto)
            ) {
                const estadisticas =
                    await this.nexoEngine.ejecutar(
                        "ESTADISTICAS_MERMA",
                        {}
                    );

                if (estadisticas.length === 0) {
                    return {
                        respuesta:
                            "Todavía no hay rilevaciones de merma registradas.",
                        accion: "MERMA_ESTADISTICAS",
                        estadisticas
                    };
                }

                const resumen = estadisticas
                    .slice(0, 5)
                    .map(
                        (e) =>
                            `${e.producto_nombre} (${e.lavorazione}): ${e.porcentaje_merma_medio_ponderado}% merma, ${e.numero_rilevazioni} rilevaciones`
                    )
                    .join(". ");

                return {
                    respuesta: `Estadísticas de merma: ${resumen}.`,
                    accion: "MERMA_ESTADISTICAS",
                    estadisticas
                };
            }

            // -----------------------------------------
            // ANULAR UNA RILEVAZIONE (sin borrar)
            // -----------------------------------------

            if (
                /\banul(?:a|ar|ame)\b/i.test(texto) &&
                /\bmerma\b/i.test(texto)
            ) {
                const numero = texto.match(/(\d+)/);

                if (!numero) {
                    return {
                        respuesta:
                            "Dime el número de la rilevazione de merma que quieres anular. Ejemplo: «anula la merma 12».",
                        accion: "MERMA_ANULAR_INCOMPLETO"
                    };
                }

                try {

                    const merma =
                        await this.nexoEngine.ejecutar(
                            "ANULAR_MERMA",
                            {
                                mermaId: Number(numero[1]),
                                responsable: "Sancho",
                                motivo: "Anulada por voz"
                            }
                        );

                    return {
                        respuesta:
                            `He anulado la rilevazione de merma #${merma.id}. El historial se conserva y ya no cuenta en las estadísticas.`,
                        accion: "MERMA_ANULADA",
                        merma
                    };

                } catch (error) {

                    return {
                        respuesta:
                            `No puedo anular la merma #${numero[1]}: ${error.message}`,
                        accion: "MERMA_ANULAR_RECHAZADA",
                        error: error.message
                    };
                }
            }

            const UNIDADES_MERMA = {
                kg: "kg", kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg",
                g: "g", gr: "g", grs: "g", gramo: "g", gramos: "g",
                l: "l", lt: "l", litro: "l", litros: "l",
                ml: "ml", mililitro: "ml", mililitros: "ml",
                ud: "ud", uds: "ud", unidad: "ud", unidades: "ud"
            };

            const UNIDAD_REGEX =
                "(?:kg|kilos?|kilogramos?|g|gr|grs?|gramos?|l|lt|litros?|ml|mililitros?|ud|uds|unidades?)";

            function parsearNumero(valor) {
                return Number(String(valor).replace(",", "."));
            }

            function parsearUnidad(valor, defecto) {
                return valor
                    ? UNIDADES_MERMA[valor.toLowerCase()] || null
                    : defecto;
            }

            // Lavorazione (texto libre)
            const patronLavorazione =
    texto.match(
        /\b(?:lavorazione|lavorazion|trabajado|trabajando|trabajo|proceso|elaboraci[oó]n|operaci[oó]n)\b[\s:]+([a-záéíóúñü]+(?:\s+[a-záéíóúñü]+)?)/i
    ) ||
  texto.match(
    /\ben\s+([a-záéíóúñü0-9_]+)\s*$/i
);

            const lavorazione = patronLavorazione
                ? patronLavorazione[1].trim()
                : null;

            // Se quita la frase de lavorazione para no confundirla con el producto
            const textoMerma = patronLavorazione
                ? texto.replace(patronLavorazione[0], " ")
                : texto;

            // Cantidad trabajada: "trabajado 3 kg de tomate" / "trabajé 3 kg de tomate"
           const patronLavorado = textoMerma.match(
    new RegExp(
        "(?:trabajad[oa]s?|lavorat[oa]s?|procesad[oa]s?|trabaj[eé]|trabajando|lavorando)\\s+" +
        "(?:(\\d+(?:[.,]\\d+)?)\\s*(" + UNIDAD_REGEX + ")?\\s*(?:de\\s+)?)?" +
        "([a-záéíóúñü][^,;]*?)(?=,|;|\\by\\b|\\bmerma\\b|$)",
        "i"
    )
);
            // Cantidad de merma: "95 g de merma" / "merma 95 g" / "merma de 95 g"
            const patronMermaCantidad =
                textoMerma.match(
                    new RegExp(
                        "(\\d+(?:[.,]\\d+)?)\\s*" + UNIDAD_REGEX +
                        "?\\s*(?:de\\s+)?merma",
                        "i"
                    )
                ) ||
                textoMerma.match(
                    new RegExp(
                        "merma\\s*(?:de\\s*)?(\\d+(?:[.,]\\d+)?)\\s*" +
                        UNIDAD_REGEX + "?",
                        "i"
                    )
                );

            let nombreProducto = patronLavorado
    ? patronLavorado[3]
        .replace(/\b(trabajad[oa]s?|lavorat[oa]s?|procesad[oa]s?)\b/gi, "")
        .replace(/^(el|la|los|las|un|una)\s+/i, "")
        .trim()
    : null;

// Caso: "merma de SALSA TARTUFATA: trabajé 3 ud..."
const patronProductoMerma = texto.match(
    /\bmerma\s+de\s+(.+?)\s*:/i
);

if (patronProductoMerma) {
    nombreProducto = patronProductoMerma[1].trim();
}

            if (!nombreProducto) {
                return {
                    respuesta:
                        "Indícame qué producto has trabajado. Ejemplo: «he trabajado 3 kg de tomate, merma 95 g, lavorazione mondatura».",
                    accion: "MERMA_INCOMPLETA"
                };
            }

            const productos = await productoService.buscarProductos(
                this.pool,
                nombreProducto,
                5
            );

            if (productos.length === 0) {
                return {
                    respuesta:
                        `No encuentro el producto "${nombreProducto}" para registrar la merma.`,
                    accion: "PRODUCTO_NO_ENCONTRADO",
                    producto_buscado: nombreProducto
                };
            }

            if (productos.length > 1) {
                const opciones = productos
                    .map((producto, indice) => `${indice + 1}. ${producto.nombre}`)
                    .join(", ");

                this.seleccionMermaPendiente = {
                    productos,
                    lavorazione,
                    cantidadLavorada: patronLavorado
                        ? parsearNumero(patronLavorado[1])
                        : null,
                    textoUnidadLavorado: patronLavorado
                        ? patronLavorado[2]
                        : null,
                    cantidadMerma: patronMermaCantidad
                        ? parsearNumero(patronMermaCantidad[1])
                        : null,
                    textoUnidadMerma: patronMermaCantidad
                        ? patronMermaCantidad[2]
                        : null
                };

                return {
                    respuesta:
                        `He encontrado varios productos: ${opciones}. Indica el número o el nombre completo de uno de ellos para registrar la merma.`,
                    accion: "SELECCIONAR_PRODUCTO_MERMA",
                    productos
                };
            }

            const producto = productos[0];
if (!patronLavorado || !patronLavorado[1]) {
                return {
                    respuesta:
                        "Indícame cuánto has trabajado. Ejemplo: «he trabajado 3 kg de tomate, merma 95 g, lavorazione mondatura».",
                    accion: "MERMA_INCOMPLETA",
                    producto
                };
            }

            if (!lavorazione) {
                return {
                    respuesta:
                        `¿Cuál es la lavorazione de ${producto.nombre}? Ejemplo: «lavorazione mondatura».`,
                    accion: "MERMA_INCOMPLETA",
                    producto
                };
            }

            if (!patronMermaCantidad) {
                return {
                    respuesta:
                        `¿Cuánta merma has quitado de ${producto.nombre}? Ejemplo: «merma 95 g».`,
                    accion: "MERMA_INCOMPLETA",
                    producto,
                    lavorazione
                };
            }

            const unidadProducto = producto.unidad || null;
            const unidadLavorado = parsearUnidad(
                patronLavorado[2],
                unidadProducto
            );
            const unidadMerma = parsearUnidad(
                patronMermaCantidad[2],
                unidadLavorado
            );

            if (!unidadLavorado || !unidadMerma) {
                return {
                    respuesta:
                        `No reconozco la unidad de ${producto.nombre}. Di por ejemplo «3 kg de ${producto.nombre}, merma 95 g».`,
                    accion: "MERMA_UNIDAD_NO_VALIDA",
                    producto
                };
            }

            const datos = {
                producto_id: producto.id,
                lavorazione,
                cantidad_lavorada: parsearNumero(patronLavorado[1]),
                unidad: unidadLavorado,
                cantidad_merma: parsearNumero(patronMermaCantidad[1]),
                unidad_merma: unidadMerma,
                responsable: "Sancho"
            };

            this.confirmacionMermaPendiente = {
                producto,
                datos
            };

            return {
                respuesta:
                    `Vas a registrar la merma de ${producto.nombre}: lavorado ${datos.cantidad_lavorada} ${datos.unidad}, merma ${datos.cantidad_merma} ${datos.unidad_merma}, lavorazione ${lavorazione}. ¿Confirmas?`,
                accion: "CONFIRMAR_MERMA",
                producto,
                datos
            };
        }

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
            "Te puedo ayudar con pedidos y producción. Por ejemplo: «tenemos que hacer el pedido», «dime qué tenemos bajo stock», «pide 2 cajas de harina», «produce 2 bolsas de Enasalada de Verano» o «qué pedidos tenemos preparados».",
        accion: "AYUDA"
    };
    }
}

module.exports = SanchoChat;
