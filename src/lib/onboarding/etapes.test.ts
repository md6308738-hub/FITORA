import { describe, expect, it } from "vitest";

import { ETAPES } from "./etapes";

function schema(id: string) {
  const etape = ETAPES.find((e) => e.id === id);
  if (!etape) throw new Error(`Étape inconnue : ${id}`);
  return etape.schema;
}

describe("étape mensurations", () => {
  it("convertit les saisies en nombres, virgule décimale comprise", () => {
    expect(
      schema("mensurations").parse({ age: "29", sexe: "", taille_cm: "178", poids_kg: "72,5" }),
    ).toEqual({ age: 29, sexe: undefined, taille_cm: 178, poids_kg: 72.5 });
  });

  it("signale les champs obligatoires manquants et les valeurs hors limites", () => {
    const resultat = schema("mensurations").safeParse({
      age: "",
      taille_cm: "90",
      poids_kg: "72",
    });
    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      const messages = Object.fromEntries(
        resultat.error.issues.map((i) => [i.path.join("."), i.message]),
      );
      expect(messages.age).toBe("Indiquez votre âge.");
      expect(messages.taille_cm).toBe("Indiquez une valeur entre 120 et 230 cm.");
    }
  });
});

describe("étape activités", () => {
  it("exige au moins une activité", () => {
    expect(schema("activites").safeParse({ activites: false }).success).toBe(false);
    expect(schema("activites").parse({ activites: "cardio" })).toEqual({
      activites: ["cardio"],
    });
  });
});

describe("étapes facultatives", () => {
  it("acceptent un formulaire vide (bouton Passer)", () => {
    for (const etape of ETAPES.filter((e) => e.facultative)) {
      expect(etape.schema.safeParse({}).success).toBe(true);
    }
  });

  it("refusent les valeurs inconnues", () => {
    expect(
      schema("alimentation").safeParse({ restrictions_alimentaires: ["pizza"] }).success,
    ).toBe(false);
  });
});
