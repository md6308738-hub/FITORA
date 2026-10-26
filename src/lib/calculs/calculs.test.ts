import { describe, expect, it } from "vitest";

import { objectifHydratationMl } from "./hydratation";
import { estimerBesoins } from "./nutrition";
import { joursEntrainement, seanceDuJour } from "./planning";
import { progressionPoids } from "./progression";
import { calculerStatistiques } from "./statistiques";

describe("estimerBesoins", () => {
  it("applique Mifflin-St Jeor et le facteur d'activité (homme, maintien)", () => {
    const besoins = estimerBesoins({
      poidsKg: 80,
      tailleCm: 180,
      age: 30,
      sexe: "homme",
      niveauActivite: "modere",
      objectif: "maintien",
    });
    expect(besoins).toEqual({
      metabolismeBaseKcal: 1780,
      depenseTotaleKcal: 2760,
      apportCibleKcal: 2760,
      proteinesG: 128,
      lipidesG: 77,
      glucidesG: 389,
      precision: "standard",
    });
  });

  it("réduit l'apport pour une perte de poids sans passer sous le métabolisme de base", () => {
    const besoins = estimerBesoins({
      poidsKg: 60,
      tailleCm: 165,
      age: 25,
      sexe: "femme",
      niveauActivite: "sedentaire",
      objectif: "perte_de_poids",
    });
    expect(besoins.metabolismeBaseKcal).toBe(1350);
    expect(besoins.apportCibleKcal).toBe(1370);
    expect(besoins.apportCibleKcal).toBeGreaterThanOrEqual(besoins.metabolismeBaseKcal);
  });

  it("signale une précision réduite sans sexe renseigné", () => {
    const besoins = estimerBesoins({
      poidsKg: 70,
      tailleCm: 170,
      age: 40,
      sexe: null,
      niveauActivite: "leger",
      objectif: "endurance",
    });
    expect(besoins.precision).toBe("reduite");
  });
});

describe("progressionPoids", () => {
  it("calcule l'avancement vers le poids objectif", () => {
    expect(progressionPoids(90, 85, 80, "perte_de_poids")).toEqual({
      variationKg: -5,
      resteKg: 5,
      pourcentage: 50,
    });
  });

  it("reste à 0 % quand le poids s'éloigne de la cible", () => {
    expect(progressionPoids(90, 92, 80, "perte_de_poids").pourcentage).toBe(0);
  });

  it("fonctionne pour une prise de masse et plafonne à 100 %", () => {
    expect(progressionPoids(60, 66, 65, "prise_de_masse").pourcentage).toBe(100);
  });

  it("n'affiche pas de pourcentage sans cible ou en maintien", () => {
    expect(progressionPoids(70, 69.5, null, "force").pourcentage).toBeNull();
    expect(progressionPoids(70, 69.5, 70, "maintien").pourcentage).toBeNull();
  });
});

describe("planning", () => {
  it("espace les séances dans la semaine", () => {
    expect(joursEntrainement(3)).toEqual([1, 3, 5]);
    expect(joursEntrainement(9)).toHaveLength(7);
  });

  it("alterne les activités et indique le prochain jour de séance", () => {
    const activites = ["musculation", "cardio"] as const;
    expect(seanceDuJour(3, activites, 1)).toMatchObject({ prevue: true, activite: "musculation" });
    expect(seanceDuJour(3, activites, 3)).toMatchObject({ prevue: true, activite: "cardio", numero: 2 });
    expect(seanceDuJour(3, activites, 2)).toEqual({ prevue: false, prochainJour: 3 });
    expect(seanceDuJour(3, activites, 7)).toEqual({ prevue: false, prochainJour: 1 });
  });
});

describe("objectifHydratationMl", () => {
  it("calcule 35 ml/kg, borné entre 1,5 et 4 litres", () => {
    expect(objectifHydratationMl(70)).toBe(2450);
    expect(objectifHydratationMl(30)).toBe(1500);
    expect(objectifHydratationMl(150)).toBe(4000);
  });
});

describe("calculerStatistiques", () => {
  it("n'utilise que les données enregistrées", () => {
    const stats = calculerStatistiques(
      [
        { mesure_le: "2026-10-10", poids_kg: 80 },
        { mesure_le: "2026-10-26", poids_kg: 78.4 },
      ],
      [
        { jour: "2026-10-25", quantite_ml: 1000 },
        { jour: "2026-10-26", quantite_ml: 400 },
      ],
      "2026-10-10",
      "2026-10-26",
    );
    expect(stats).toEqual({
      joursDeSuivi: 17,
      nombrePesees: 2,
      variation7JoursKg: -1.6,
      moyenneEau7JoursMl: 200,
    });
  });

  it("renvoie null quand les données manquent", () => {
    const stats = calculerStatistiques([{ mesure_le: "2026-10-26", poids_kg: 70 }], [], "2026-10-26", "2026-10-26");
    expect(stats.variation7JoursKg).toBeNull();
    expect(stats.moyenneEau7JoursMl).toBeNull();
    expect(stats.joursDeSuivi).toBe(1);
  });
});
