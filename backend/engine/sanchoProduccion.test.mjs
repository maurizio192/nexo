import { describe, it, expect } from "vitest";
import sanchoProduccion from "./sanchoProduccion.js";

describe("sanchoProduccion", () => {

  it("genera la lista delle tapas", () => {
    const resultado = sanchoProduccion([
      { categoria: "TAPA", nombre: "ENSALADILLA" },
      { categoria: "TAPA", nombre: "CROQUETA" }
    ]);

    expect(resultado).toContain("Hoy hay que preparar las siguientes tapas:");
    expect(resultado).toContain("• ENSALADILLA");
    expect(resultado).toContain("• CROQUETA");
  });

  it("genera la lista de elaboraciones", () => {
    const resultado = sanchoProduccion([
      { categoria: "ELABORACION", nombre: "SALSA TOMATE" },
      { categoria: "ELABORACION", nombre: "FONDO OSCURO" }
    ]);

    expect(resultado).toContain("Además tendremos que reponer:");
    expect(resultado).toContain("• SALSA TOMATE");
    expect(resultado).toContain("• FONDO OSCURO");
  });

  it("incluye tapas y elaboraciones en la misma respuesta", () => {
    const resultado = sanchoProduccion([
      { categoria: "TAPA", nombre: "ENSALADILLA" },
      { categoria: "ELABORACION", nombre: "SALSA TOMATE" }
    ]);

    expect(resultado).toContain("Hoy hay que preparar las siguientes tapas:");
    expect(resultado).toContain("• ENSALADILLA");
    expect(resultado).toContain("Además tendremos que reponer:");
    expect(resultado).toContain("• SALSA TOMATE");
  });

  it("indica que la producción ha terminado cuando no hay tareas", () => {
    const resultado = sanchoProduccion([]);

    expect(resultado).toBe(
      "La producción está terminada.\nTodo está preparado para el servicio."
    );
  });

  it("ignora tareas con categorías diferentes", () => {
    const resultado = sanchoProduccion([
      { categoria: "OTRA", nombre: "TAREA EXTRA" }
    ]);

    expect(resultado).toBe(
      "La producción está terminada.\nTodo está preparado para el servicio."
    );
  });

});
