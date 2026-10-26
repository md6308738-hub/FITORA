import type { Profil } from "@/types/database";

import { NOMBRE_ETAPES, type EtapeId } from "./etapes";

type Valeurs = Record<string, unknown>;

const texte = (valeur: number | string | null | undefined) =>
  valeur === null || valeur === undefined ? "" : String(valeur);

/** Réponses déjà enregistrées, au format attendu par les champs du formulaire (chaînes). */
export function valeursInitiales(
  profil: Profil,
  poidsActuelKg: number | null,
): Record<EtapeId, Valeurs> {
  return {
    mensurations: {
      age: texte(profil.age),
      sexe: profil.sexe ?? "",
      taille_cm: texte(profil.taille_cm),
      poids_kg: texte(poidsActuelKg),
    },
    objectif: {
      objectif: profil.objectif ?? "",
      poids_objectif_kg: texte(profil.poids_objectif_kg),
    },
    niveau: { niveau: profil.niveau ?? "" },
    activites: { activites: profil.activites },
    disponibilites: {
      jours_par_semaine: texte(profil.jours_par_semaine),
      duree_seance_min: texte(profil.duree_seance_min),
    },
    materiel: { materiel: profil.materiel ?? "" },
    experience: {
      experience: profil.experience ?? "",
      exercices_preferes: profil.exercices_preferes ?? "",
    },
    alimentation: {
      restrictions_alimentaires: profil.restrictions_alimentaires,
      allergies: profil.allergies ?? "",
      budget_alimentaire: profil.budget_alimentaire ?? "",
      aliments_preferes: profil.aliments_preferes ?? "",
    },
    "mode-de-vie": {
      sommeil_heures: texte(profil.sommeil_heures),
      niveau_activite: profil.niveau_activite ?? "",
      blessures: profil.blessures ?? "",
    },
  };
}

/** Étape à afficher : la première non validée (bornée à la dernière). */
export function etapeDeReprise(profil: Pick<Profil, "onboarding_etape">): number {
  return Math.min(Math.max(profil.onboarding_etape, 0), NOMBRE_ETAPES - 1);
}
