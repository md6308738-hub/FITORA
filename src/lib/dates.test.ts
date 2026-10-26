import { describe, expect, it } from "vitest";

import { decalerJour, jourLocal, jourSemaine, joursEntre } from "./dates";

describe("dates", () => {
  it("donne le jour dans le fuseau demandé", () => {
    const instant = new Date("2026-10-26T23:30:00Z");
    expect(jourLocal(instant, "Africa/Dakar")).toBe("2026-10-26");
    expect(jourLocal(instant, "Europe/Paris")).toBe("2026-10-27");
  });

  it("donne le jour de la semaine ISO", () => {
    expect(jourSemaine(new Date("2026-10-26T10:00:00Z"))).toBe(1); // lundi
    expect(jourSemaine(new Date("2026-11-01T10:00:00Z"))).toBe(7); // dimanche
  });

  it("décale et compte les jours, changements de mois compris", () => {
    expect(decalerJour("2026-10-30", 3)).toBe("2026-11-02");
    expect(decalerJour("2026-03-01", -1)).toBe("2026-02-28");
    expect(joursEntre("2026-10-01", "2026-10-26")).toBe(25);
  });
});
