import { describe, expect, it } from "vitest";

import { ALIMENTS, trouverAliment } from "./aliments";
import { allergenesDepuisTexte, apportsElements, genererPlan, listeDeCourses, planSchema, type ParametresPlan } from "./plan";

const base: ParametresPlan = {
  kcalCible: 2400,
  proteinesCibleG: 140,
  restrictions: [],
  allergies: null,
  budget: "moyen",
  alimentsPreferes: null,
};

const tousLesAliments = (plan: ReturnType<typeof genererPlan>) =>
  plan.jours.flatMap((j) => j.repas.flatMap((r) => r.elements.map((e) => trouverAliment(e.alimentId))));

describe("catalogue alimentaire", () => {
  // Tolérance absolue de 5 kcal : les fibres des légumes très peu caloriques faussent le calcul d'Atwater.
  it("a des identifiants uniques et des valeurs cohérentes (Atwater ± 25 % ou ± 5 kcal)", () => {
    expect(new Set(ALIMENTS.map((a) => a.id)).size).toBe(ALIMENTS.length);
    for (const a of ALIMENTS) {
      const calcule = a.proteines * 4 + a.glucides * 4 + a.lipides * 9;
      expect(Math.abs(calcule - a.kcal)).toBeLessThan(Math.max(5, a.kcal * 0.25));
    }
  });
});

describe("genererPlan", () => {
  it("produit 7 jours valides proches de la cible calorique", () => {
    const plan = genererPlan(base);
    expect(planSchema.safeParse(plan).success).toBe(true);
    for (const jour of plan.jours) {
      const kcal = apportsElements(jour.repas.flatMap((r) => r.elements)).kcal;
      expect(kcal).toBeGreaterThan(base.kcalCible * 0.8);
      expect(kcal).toBeLessThan(base.kcalCible * 1.2);
    }
  });

  it("respecte un régime végan et sans gluten", () => {
    const plan = genererPlan({ ...base, restrictions: ["vegan", "sans_gluten"] });
    for (const aliment of tousLesAliments(plan)) {
      expect(aliment?.regimes).toContain("vegan");
      expect(aliment?.allergenes).not.toContain("gluten");
    }
  });

  it("exclut les allergènes déclarés en texte libre", () => {
    const plan = genererPlan({ ...base, allergies: "Allergie aux arachides et au poisson" });
    for (const aliment of tousLesAliments(plan)) {
      expect(aliment?.allergenes).not.toContain("arachide");
      expect(aliment?.allergenes).not.toContain("poisson");
    }
  });

  it("signale une allergie non reconnue au lieu de l'ignorer", () => {
    expect(allergenesDepuisTexte("kiwi").nonReconnu).toBe(true);
    expect(genererPlan({ ...base, allergies: "kiwi" }).avertissements[0]).toContain("pas été reconnue");
  });

  it("évite les aliments chers avec un budget serré et varie selon la variante", () => {
    const plan = genererPlan({ ...base, budget: "serre" });
    for (const aliment of tousLesAliments(plan)) expect(aliment?.cout).not.toBe("eleve");
    expect(genererPlan({ ...base, variante: 1 })).not.toEqual(genererPlan(base));
  });

  it("agrège une liste de courses cohérente avec le plan", () => {
    const plan = genererPlan(base);
    const total = listeDeCourses(plan).flatMap((c) => c.articles).reduce((t, a) => t + a.grammes, 0);
    const attendu = plan.jours.flatMap((j) => j.repas.flatMap((r) => r.elements)).reduce((t, e) => t + e.grammes, 0);
    expect(total).toBe(attendu);
  });
});
