import type { Option } from "@/components/ui/choice-group";
import type {
  Activite,
  BudgetAlimentaire,
  MaterielDisponible,
  NiveauActivite,
  NiveauSportif,
  ObjectifPrincipal,
  RestrictionAlimentaire,
  Sexe,
} from "@/types/database";

export const OPTIONS_SEXE: readonly Option<Sexe>[] = [
  { valeur: "femme", libelle: "Femme" },
  { valeur: "homme", libelle: "Homme" },
  { valeur: "autre", libelle: "Autre" },
];

export const OPTIONS_OBJECTIF: readonly Option<ObjectifPrincipal>[] = [
  { valeur: "prise_de_masse", libelle: "Prise de masse", description: "Gagner du muscle" },
  { valeur: "perte_de_poids", libelle: "Perte de poids", description: "Réduire la masse grasse" },
  { valeur: "force", libelle: "Force", description: "Soulever plus lourd" },
  { valeur: "endurance", libelle: "Endurance", description: "Tenir plus longtemps" },
  { valeur: "maintien", libelle: "Maintien", description: "Rester en forme" },
];

export const OPTIONS_NIVEAU: readonly Option<NiveauSportif>[] = [
  { valeur: "debutant", libelle: "Débutant", description: "Moins de 6 mois de pratique régulière" },
  { valeur: "intermediaire", libelle: "Intermédiaire", description: "6 mois à 2 ans de pratique" },
  { valeur: "avance", libelle: "Avancé", description: "Plus de 2 ans de pratique structurée" },
];

export const OPTIONS_ACTIVITE: readonly Option<Activite>[] = [
  { valeur: "musculation", libelle: "Musculation" },
  { valeur: "fitness", libelle: "Fitness" },
  { valeur: "cardio", libelle: "Cardio" },
  { valeur: "domicile", libelle: "Entraînement à domicile" },
];

export const OPTIONS_JOURS: readonly Option[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  valeur: String(n),
  libelle: n === 1 ? "1 jour" : `${n} jours`,
}));

export const OPTIONS_DUREE: readonly Option[] = [30, 45, 60, 75, 90].map((n) => ({
  valeur: String(n),
  libelle: `${n} min`,
}));

export const OPTIONS_MATERIEL: readonly Option<MaterielDisponible>[] = [
  { valeur: "salle", libelle: "Salle de sport" },
  { valeur: "domicile", libelle: "Matériel à domicile", description: "Haltères, élastiques…" },
  { valeur: "aucun", libelle: "Aucun matériel", description: "Poids du corps uniquement" },
];

export const OPTIONS_RESTRICTION: readonly Option<RestrictionAlimentaire>[] = [
  { valeur: "vegetarien", libelle: "Végétarien" },
  { valeur: "vegan", libelle: "Végan" },
  { valeur: "halal", libelle: "Halal" },
  { valeur: "sans_gluten", libelle: "Sans gluten" },
  { valeur: "sans_lactose", libelle: "Sans lactose" },
];

export const OPTIONS_BUDGET: readonly Option<BudgetAlimentaire>[] = [
  { valeur: "serre", libelle: "Serré" },
  { valeur: "moyen", libelle: "Moyen" },
  { valeur: "confortable", libelle: "Confortable" },
];

export const OPTIONS_NIVEAU_ACTIVITE: readonly Option<NiveauActivite>[] = [
  { valeur: "sedentaire", libelle: "Sédentaire", description: "Travail assis, peu de marche" },
  { valeur: "leger", libelle: "Légèrement actif", description: "Marche quotidienne modérée" },
  { valeur: "modere", libelle: "Modérément actif", description: "Debout une bonne partie de la journée" },
  { valeur: "eleve", libelle: "Très actif", description: "Travail physique" },
  { valeur: "tres_eleve", libelle: "Extrêmement actif", description: "Travail physique intense et quotidien" },
];

/** Libellé d'une valeur, ou la valeur elle-même si elle est inconnue. */
export function libelle<V extends string>(options: readonly Option<V>[], valeur: V): string {
  return options.find((option) => option.valeur === valeur)?.libelle ?? valeur;
}
