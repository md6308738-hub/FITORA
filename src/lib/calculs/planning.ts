import type { Activite } from "@/types/database";

/**
 * Répartition conseillée des jours d'entraînement dans la semaine
 * (1 = lundi … 7 = dimanche), en espaçant les séances.
 */
const REPARTITION: Record<number, readonly number[]> = {
  1: [3],
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [1, 2, 3, 4, 5, 6, 7],
};

export function joursEntrainement(joursParSemaine: number): readonly number[] {
  const n = Math.min(7, Math.max(1, Math.round(joursParSemaine)));
  return REPARTITION[n] ?? [];
}

export type SeanceDuJour =
  | { prevue: true; activite: Activite; numero: number; total: number }
  | { prevue: false; prochainJour: number };

/** Séance suggérée pour un jour donné, en alternant les activités choisies. */
export function seanceDuJour(
  joursParSemaine: number,
  activites: readonly Activite[],
  jour: number,
): SeanceDuJour {
  const jours = joursEntrainement(joursParSemaine);
  const position = jours.indexOf(jour);

  if (position === -1 || activites.length === 0) {
    const prochainJour = jours.find((j) => j > jour) ?? jours[0] ?? jour;
    return { prevue: false, prochainJour };
  }

  const activite = activites[position % activites.length] as Activite;
  return { prevue: true, activite, numero: position + 1, total: jours.length };
}

export const NOMS_JOURS = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
