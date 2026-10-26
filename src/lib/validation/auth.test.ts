import { describe, expect, it } from "vitest";

import { connexionSchema, erreursParChamp, inscriptionSchema } from "./auth";

const valide = {
  prenom: "Awa",
  nom: "Ndiaye",
  email: "awa@example.com",
  motDePasse: "motdepasse1",
  confirmation: "motdepasse1",
};

describe("inscriptionSchema", () => {
  it("accepte une inscription valide et nettoie les espaces", () => {
    const resultat = inscriptionSchema.parse({ ...valide, prenom: "  Awa " });
    expect(resultat.prenom).toBe("Awa");
  });

  it("accepte les noms composés et accentués", () => {
    expect(
      inscriptionSchema.safeParse({ ...valide, prenom: "Marie-Élise", nom: "N'Diaye" })
        .success,
    ).toBe(true);
  });

  it("refuse une confirmation différente, sur le champ confirmation", () => {
    const resultat = inscriptionSchema.safeParse({ ...valide, confirmation: "autre123" });
    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      expect(erreursParChamp(resultat.error)).toEqual({
        confirmation: "Les mots de passe ne correspondent pas.",
      });
    }
  });

  it("exige au moins 8 caractères, une lettre et un chiffre", () => {
    for (const motDePasse of ["court1", "sanschiffre", "12345678"]) {
      expect(
        inscriptionSchema.safeParse({ ...valide, motDePasse, confirmation: motDePasse })
          .success,
      ).toBe(false);
    }
  });

  it("refuse un email invalide", () => {
    expect(inscriptionSchema.safeParse({ ...valide, email: "awa@" }).success).toBe(false);
  });
});

describe("connexionSchema", () => {
  it("exige l'email et le mot de passe", () => {
    const resultat = connexionSchema.safeParse({ email: "", motDePasse: "" });
    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      expect(Object.keys(erreursParChamp(resultat.error)).sort()).toEqual([
        "email",
        "motDePasse",
      ]);
    }
  });
});
