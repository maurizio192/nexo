import { describe, it, expect } from "vitest";
import evaluarEstadoCocina from "./motorEstadoCocina.js";

describe("evaluarEstadoCocina", () => {

  it("restituisce lo stato normale senza incidenze", () => {
    const resultado = evaluarEstadoCocina({
      incidencias: [],
      pedidosPendientes: []
    });

    expect(resultado).toEqual({
      modo: "NORMAL",
      estado: "OPERATIVA",
      prioridad: "NINGUNA",
      nivel: "VERDE",
      mensaje: "Todo funciona correctamente."
    });
  });

  it("imposta PREPARACION durante il turno di producción", () => {
    const resultado = evaluarEstadoCocina({
      inicio: {
        turno: "PRODUCCION_MAÑANA"
      },
      incidencias: [],
      pedidosPendientes: []
    });

    expect(resultado.modo).toBe("PREPARACION");
  });

  it("imposta SERVICIO durante il turno di servicio", () => {
    const resultado = evaluarEstadoCocina({
      inicio: {
        turno: "SERVICIO_NOCHE"
      },
      incidencias: [],
      pedidosPendientes: []
    });

    expect(resultado.modo).toBe("SERVICIO");
  });

  it("detecta rischio operativo quando un prodotto è senza stock", () => {
    const resultado = evaluarEstadoCocina({
      incidencias: [
        {
          nombre: "HARINA",
          stock_actual: 0
        }
      ],
      pedidosPendientes: []
    });

    expect(resultado.estado).toBe("RIESGO_OPERATIVO");
    expect(resultado.prioridad).toBe("STOCK");
    expect(resultado.nivel).toBe("ROJO");
  });

  it("detecta incidencias quando ci sono prodotti sotto il minimo", () => {
    const resultado = evaluarEstadoCocina({
      incidencias: [
        {
          nombre: "ACEITE",
          stock_actual: 2,
          stock_minimo: 10
        }
      ],
      pedidosPendientes: []
    });

    expect(resultado.estado).toBe("OPERATIVA_CON_INCIDENCIAS");
    expect(resultado.prioridad).toBe("STOCK");
    expect(resultado.nivel).toBe("AMARILLO");
  });

  it("imposta priorità PEDIDOS quando ci sono ordini pendenti senza altre incidenze", () => {
    const resultado = evaluarEstadoCocina({
      incidencias: [],
      pedidosPendientes: [
        {
          id: 25
        }
      ]
    });

    expect(resultado.estado).toBe("OPERATIVA");
    expect(resultado.prioridad).toBe("PEDIDOS");
    expect(resultado.nivel).toBe("VERDE");
  });

});
