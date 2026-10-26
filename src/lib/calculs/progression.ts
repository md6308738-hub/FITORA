import type { ObjectifPrincipal } from "@/types/database";

export type ProgressionPoids = {
  /** Variation depuis la première pesée (négatif = perte). */
  variationKg: number;
  /** Kilos restant à atteindre la cible (toujours positif), null sans cible. */
  resteKg: number | null;
  /** Avancement vers la cible (0–100), null sans cible exploitable. */
  pourcentage: number | null;
};

const unDecimal = (valeur: number) => Math.round(valeur * 10) / 10;

/** Progression du poids entre la première pesée, la dernière et le poids objectif. */
export function progressionPoids(
  departKg: number,
  actuelKg: number,
  cibleKg: number | null,
  objectif: ObjectifPrincipal | null,
): ProgressionPoids {
  const variationKg = unDecimal(actuelKg - departKg);

  if (cibleKg === null || objectif === "maintien") {
    return { variationKg, resteKg: null, pourcentage: null };
  }

  const resteKg = unDecimal(Math.abs(cibleKg - actuelKg));
  const ecartTotal = cibleKg - departKg;
  if (ecartTotal === 0) {
    return { variationKg, resteKg, pourcentage: resteKg === 0 ? 100 : 0 };
  }

  const parcouru = (actuelKg - departKg) / ecartTotal;
  const pourcentage = Math.round(Math.min(1, Math.max(0, parcouru)) * 100);
  return { variationKg, resteKg, pourcentage };
}
