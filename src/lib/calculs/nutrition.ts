import type { NiveauActivite, ObjectifPrincipal, Sexe } from "@/types/database";

/** Facteurs d'activité usuels appliqués au métabolisme de base. */
export const FACTEURS_ACTIVITE: Record<NiveauActivite, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  eleve: 1.725,
  tres_eleve: 1.9,
};

/** Ajustement de l'apport selon l'objectif (part de la dépense totale). */
const AJUSTEMENT_OBJECTIF: Record<ObjectifPrincipal, number> = {
  perte_de_poids: -0.15,
  prise_de_masse: 0.1,
  force: 0.05,
  endurance: 0,
  maintien: 0,
};

/** Protéines conseillées en grammes par kilo de poids corporel. */
const PROTEINES_PAR_KG: Record<ObjectifPrincipal, number> = {
  perte_de_poids: 2,
  prise_de_masse: 1.8,
  force: 1.8,
  endurance: 1.4,
  maintien: 1.6,
};

/** Part des calories apportée par les lipides. */
const PART_LIPIDES = 0.25;

export type DonneesNutrition = {
  poidsKg: number;
  tailleCm: number;
  age: number;
  sexe: Sexe | null;
  niveauActivite: NiveauActivite;
  objectif: ObjectifPrincipal;
};

export type BesoinsEstimes = {
  metabolismeBaseKcal: number;
  depenseTotaleKcal: number;
  apportCibleKcal: number;
  proteinesG: number;
  lipidesG: number;
  glucidesG: number;
  /** "reduite" si le sexe n'est pas renseigné : constante moyenne utilisée. */
  precision: "standard" | "reduite";
};

const arrondir = (valeur: number, pas: number) => Math.round(valeur / pas) * pas;

/**
 * Estimation des besoins caloriques (formule de Mifflin-St Jeor) et répartition
 * des macronutriments. Il s'agit d'une estimation, pas d'une prescription.
 */
export function estimerBesoins(donnees: DonneesNutrition): BesoinsEstimes {
  const { poidsKg, tailleCm, age, sexe, niveauActivite, objectif } = donnees;

  const constanteSexe = sexe === "homme" ? 5 : sexe === "femme" ? -161 : -78;
  const metabolismeBase = 10 * poidsKg + 6.25 * tailleCm - 5 * age + constanteSexe;
  const depenseTotale = metabolismeBase * FACTEURS_ACTIVITE[niveauActivite];
  // Jamais en dessous du métabolisme de base.
  const apportCible = Math.max(
    metabolismeBase,
    depenseTotale * (1 + AJUSTEMENT_OBJECTIF[objectif]),
  );

  const proteinesG = poidsKg * PROTEINES_PAR_KG[objectif];
  const lipidesG = (apportCible * PART_LIPIDES) / 9;
  const glucidesG = Math.max(0, (apportCible - proteinesG * 4 - lipidesG * 9) / 4);

  return {
    metabolismeBaseKcal: arrondir(metabolismeBase, 10),
    depenseTotaleKcal: arrondir(depenseTotale, 10),
    apportCibleKcal: arrondir(apportCible, 10),
    proteinesG: Math.round(proteinesG),
    lipidesG: Math.round(lipidesG),
    glucidesG: Math.round(glucidesG),
    precision: sexe === "homme" || sexe === "femme" ? "standard" : "reduite",
  };
}
