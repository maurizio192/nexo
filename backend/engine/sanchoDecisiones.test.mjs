import { describe, it, expect } from "vitest";
import generarDecisiones from "./sanchoDecisiones.js";

describe("generarDecisiones", () => {

  it("genera una decisione di pedido quando existe stock crítico", () => {
    const resultado = generarDecisiones({
      incidencias: [
        {
          nombre: "HARINA",
          stock_actual: 2,
          stock_minimo: 10
        }
      ]
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].prioridad).toBe(1);
    expect(resultado[0].accion).toBe("PROPONER_PEDIDO");
    expect(resultado[0].productos[0].nombre).toBe("HARINA");
  });

  it("incluye los proveedores críticos sin duplicarlos", () => {
    const resultado = generarDecisiones({
      incidencias: [
        {
          nombre: "HARINA",
          stock_actual: 1,
          stock_minimo: 10
        },
        {
          nombre: "ACEITE",
          stock_actual: 0,
          stock_minimo: 5
        }
      ],
      proveedoresCriticos: [
        { proveedor: "Proveedor A" },
        { proveedor: "Proveedor A" },
        { proveedor: "Proveedor B" }
      ]
    });

    expect(resultado[0].proveedores).toEqual([
      "Proveedor A",
      "Proveedor B"
    ]);
  });

  it("genera una decision de producción cuando hay elaboraciones", () => {
    const resultado = generarDecisiones({
      inicio: {
        elaboraciones: [
          { id: 1, nombre: "SALSA" }
        ]
      }
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].prioridad).toBe(2);
    expect(resultado[0].accion).toBe("PRODUCIR");
  });

  it("genera una decision para revisar pedidos pendientes", () => {
    const resultado = generarDecisiones({
      pedidosPendientes: [
        { id: 25 }
      ]
    });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].prioridad).toBe(3);
    expect(resultado[0].accion).toBe("REVISAR_PEDIDOS");
  });

  it("ordena las decisiones por prioridad", () => {
    const resultado = generarDecisiones({
      incidencias: [
        {
          nombre: "HARINA",
          stock_actual: 0,
          stock_minimo: 5
        }
      ],
      inicio: {
        elaboraciones: [
          { id: 1, nombre: "SALSA" }
        ]
      },
      pedidosPendientes: [
        { id: 25 }
      ]
    });

    expect(resultado.map(decision => decision.prioridad)).toEqual([
      1,
      2,
      3
    ]);
  });

  it("continúa el servicio cuando no existen incidencias", () => {
    const resultado = generarDecisiones({});

    expect(resultado).toEqual([
      {
        prioridad: 99,
        accion: "CONTINUAR_SERVICIO",
        motivo: "No existen incidencias."
      }
    ]);
  });

});
