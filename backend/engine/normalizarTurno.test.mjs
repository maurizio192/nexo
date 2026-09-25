import { describe, it, expect } from "vitest";
import normalizarTurno from "./normalizarTurno.js";

describe("normalizarTurno", () => {
  it("restituisce SERVICIO se il turno è vuoto", () => {
    expect(normalizarTurno()).toBe("SERVICIO");
  });

  it("trasforma PRODUCCION in PREPARACION", () => {
    expect(normalizarTurno("PRODUCCION_MAÑANA")).toBe("PREPARACION");
  });

  it("mantiene SERVICIO come SERVICIO", () => {
    expect(normalizarTurno("SERVICIO_NOCHE")).toBe("SERVICIO");
  });

  it("trasforma un turno sconosciuto in CIERRE", () => {
    expect(normalizarTurno("OTRO")).toBe("CIERRE");
  });
});
