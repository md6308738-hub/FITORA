import { describe, expect, it } from "vitest";

import type { Profil } from "@/types/database";

import { ETAPES, NOMBRE_ETAPES } from "./etapes";
import { etapeDeReprise, valeursInitiales } from "./valeurs-initiales";

const profilVide: Profil = {
  id: "u1",
  prenom: "Awa",
  nom: "Ndiaye",
  age: null,
  sexe: null,
  taille_cm: null,
  objectif: null,
  poids_objectif_kg: null,
  niveau: null,
  activites: [],
  jours_par_semaine: null,
  duree_seance_min: null,
  materiel: null,
  experience: null,
  exercices_preferes: null,
  restrictions_alimentaires: [],
  allergies: null,
  budget_alimentaire: null,
  aliments_preferes: null,
  sommeil_heures: null,
  niveau_activite: null,
  blessures: null,
  onboarding_etape: 0,
  onboarding_termine_le: null,
  consentement_sante_le: null,
  consentement_sante_version: null,
  cree_le: "2026-10-26T10:00:00Z",
  modifie_le: "2026-10-26T10:00:00Z",
};

describe("valeursInitiales", () => {
  it("fournit des valeurs pour chaque étape", () => {
    const valeurs = valeursInitiales(profilVide, null);
    expect(Object.keys(valeurs).sort()).toEqual(ETAPES.map((e) => e.id).sort());
  });

  it("des réponses enregistrées repassent la validation de leur étape", () => {
    const profil: Profil = {
      ...profilVide,
      age: 29,
      taille_cm: 178,
      objectif: "force",
      jours_par_semaine: 3,
      duree_seance_min: 45,
    };
    const valeurs = valeursInitiales(profil, 72.5);
    const mensurations = ETAPES[0].schema.safeParse(valeurs.mensurations);
    expect(mensurations.success).toBe(true);
    const disponibilites = ETAPES.find((e) => e.id === "disponibilites")?.schema.safeParse(
      valeurs.disponibilites,
    );
    expect(disponibilites?.success).toBe(true);
  });
});

describe("etapeDeReprise", () => {
  it("reprend à la première étape non validée, sans dépasser la dernière", () => {
    expect(etapeDeReprise({ onboarding_etape: 0 })).toBe(0);
    expect(etapeDeReprise({ onboarding_etape: 4 })).toBe(4);
    expect(etapeDeReprise({ onboarding_etape: 99 })).toBe(NOMBRE_ETAPES - 1);
  });
});
