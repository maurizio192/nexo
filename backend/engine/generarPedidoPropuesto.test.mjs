import { describe, it, expect } from "vitest";
import generarPedidoPropuesto from "./generarPedidoPropuesto.js";

describe("generarPedidoPropuesto", () => {

  it("calcola la quantità necessaria rispetto allo stock minimo", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 1,
        nombre: "HARINA",
        proveedor: "Proveedor A",
        stock_actual: 2,
        stock_minimo: 10,
        stock_garantizado: 0,
        formato_compra: null,
        cantidad_formato: 0
      }
    ]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].productos[0].cantidad_necesaria).toBe(8);
    expect(resultado[0].productos[0].cantidad_propuesta).toBe(8);
  });

  it("usa stock garantizado cuando es superior al stock mínimo", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 2,
        nombre: "ACEITE",
        proveedor: "Proveedor A",
        stock_actual: 2,
        stock_minimo: 10,
        stock_garantizado: 15,
        formato_compra: null,
        cantidad_formato: 0
      }
    ]);

    expect(resultado[0].productos[0].stock_objetivo).toBe(15);
    expect(resultado[0].productos[0].cantidad_necesaria).toBe(13);
    expect(resultado[0].productos[0].cantidad_propuesta).toBe(13);
  });

  it("redondea la cantidad al formato de compra", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 3,
        nombre: "CROISSANT",
        proveedor: "Proveedor A",
        stock_actual: 4,
        stock_minimo: 20,
        stock_garantizado: 0,
        formato_compra: "50 Uds",
        cantidad_formato: 50
      }
    ]);

    const producto = resultado[0].productos[0];

    expect(producto.cantidad_necesaria).toBe(16);
    expect(producto.cantidad_propuesta).toBe(1);
    expect(producto.cantidad_formato).toBe(50);
    expect(producto.unidad).toBe("UDS");
  });

  it("extrae la cantidad del formato cuando cantidad_formato no existe", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 4,
        nombre: "HARINA",
        proveedor: "Proveedor B",
        stock_actual: 1,
        stock_minimo: 7,
        stock_garantizado: 0,
        formato_compra: "3,0 Kg",
        cantidad_formato: 0
      }
    ]);

    const producto = resultado[0].productos[0];

    expect(producto.cantidad_formato).toBe(3);
    expect(producto.unidad).toBe("KG");
    expect(producto.cantidad_propuesta).toBe(2);
  });

  it("no incluye productos cuyo stock ya alcanza el objetivo", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 5,
        nombre: "TOMATE",
        proveedor: "Proveedor C",
        stock_actual: 20,
        stock_minimo: 10,
        stock_garantizado: 15,
        formato_compra: "10 Uds",
        cantidad_formato: 10
      }
    ]);

    expect(resultado).toEqual([]);
  });

  it("agrupa los productos del mismo proveedor", () => {
    const resultado = generarPedidoPropuesto([
      {
        id: 6,
        nombre: "A",
        proveedor: "Proveedor A",
        stock_actual: 0,
        stock_minimo: 5,
        stock_garantizado: 0,
        formato_compra: null,
        cantidad_formato: 0
      },
      {
        id: 7,
        nombre: "B",
        proveedor: "Proveedor A",
        stock_actual: 1,
        stock_minimo: 4,
        stock_garantizado: 0,
        formato_compra: null,
        cantidad_formato: 0
      }
    ]);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].productos).toHaveLength(2);
    expect(resultado[0].productos[0].nombre).toBe("A");
    expect(resultado[0].productos[1].nombre).toBe("B");
  });

});
