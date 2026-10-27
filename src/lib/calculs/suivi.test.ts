import { describe, expect, it } from "vitest";

import { avancementObjectif, bilanPeriode, lundiDe, meilleuresCharges, regularite, seancesParSemaine, surPeriode } from "./suivi";

const vide = { poidsDepart: null, poidsActuel: null, seancesCetteSemaine: 0, eauAujourdhuiMl: 0, pasAujourdhui: null };

describe("semaines et régularité", () => {
  it("ramène un jour au lundi de sa semaine", () => {
    expect(lundiDe("2026-10-27")).toBe("2026-10-26"); // mardi → lundi
    expect(lundiDe("2026-11-01")).toBe("2026-10-26"); // dimanche → lundi
  });

  it("compte les séances par semaine, semaines vides comprises", () => {
    const parSemaine = seancesParSemaine(["2026-10-20", "2026-10-22", "2026-10-27"], "2026-10-27", 3);
    expect(parSemaine).toEqual([
      { semaine: "2026-10-12", nombre: 0 },
      { semaine: "2026-10-19", nombre: 2 },
      { semaine: "2026-10-26", nombre: 1 },
    ]);
    // La semaine en cours n'est pas comptée dans la régularité.
    expect(regularite(parSemaine, 2)).toBe(50);
    expect(regularite([{ nombre: 3 }], 3)).toBeNull();
  });
});

describe("meilleuresCharges", () => {
  it("garde la meilleure charge par exercice et ignore le poids du corps", () => {
    expect(
      meilleuresCharges([
        { exercice_id: "squat-barre", charge_kg: 60, repetitions: 8 },
        { exercice_id: "squat-barre", charge_kg: 70, repetitions: 5 },
        { exercice_id: "pompes", charge_kg: null, repetitions: 20 },
      ]),
    ).toEqual([{ exerciceId: "squat-barre", chargeKg: 70, repetitions: 5 }]);
  });
});

describe("surPeriode", () => {
  it("filtre les points sur la période demandée", () => {
    const points = [{ jour: "2026-09-01" }, { jour: "2026-10-21" }, { jour: "2026-10-27" }];
    expect(surPeriode(points, "2026-10-27", 7)).toEqual([{ jour: "2026-10-21" }, { jour: "2026-10-27" }]);
  });
});

describe("avancementObjectif", () => {
  it("calcule l'avancement sans inventer de données", () => {
    expect(avancementObjectif("poids", 72, { ...vide, poidsDepart: 80, poidsActuel: 76 })).toBe(50);
    expect(avancementObjectif("poids", 72, vide)).toBeNull();
    expect(avancementObjectif("seances_semaine", 3, { ...vide, seancesCetteSemaine: 4 })).toBe(100);
    expect(avancementObjectif("hydratation", 2000, { ...vide, eauAujourdhuiMl: 500 })).toBe(25);
    expect(avancementObjectif("pas", 8000, vide)).toBeNull();
  });
});

describe("bilanPeriode", () => {
  it("résume le mois et propose des pistes d'après les données réelles", () => {
    const bilan = bilanPeriode({
      debut: "2026-10-01",
      fin: "2026-10-28",
      joursSeances: ["2026-10-02", "2026-10-09", "2026-09-30"],
      seancesParSemaineCible: 3,
      pesees: [{ jour: "2026-10-01", poids: 80 }, { jour: "2026-10-27", poids: 78.6 }],
      eauParJour: new Map([["2026-10-05", 2500], ["2026-10-06", 900]]),
      objectifEauMl: 2400,
      objectifsAtteints: 1,
    });
    expect(bilan.seances).toBe(2);
    expect(bilan.seancesPrevues).toBe(12);
    expect(bilan.variationPoidsKg).toBe(-1.4);
    expect(bilan.joursHydratationAtteinte).toBe(1);
    expect(bilan.aAmeliorer.length).toBeGreaterThan(0);
    expect(bilan.propositions.length).toBe(bilan.aAmeliorer.length);
  });
});
