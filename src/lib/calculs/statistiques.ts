import { decalerJour, joursEntre } from "@/lib/dates";

import { totalParJour } from "./hydratation";

type PeseeSimple = { mesure_le: string; poids_kg: number };
type PriseSimple = { jour: string; quantite_ml: number };

export type Statistiques = {
  joursDeSuivi: number;
  nombrePesees: number;
  /** Variation sur 7 jours, null sans pesée datant d'au moins 7 jours. */
  variation7JoursKg: number | null;
  /** Moyenne bue par jour sur les 7 derniers jours suivis, null sans donnée. */
  moyenneEau7JoursMl: number | null;
};

/** Statistiques calculées uniquement à partir des données enregistrées. */
export function calculerStatistiques(
  pesees: readonly PeseeSimple[],
  prises: readonly PriseSimple[],
  debutSuivi: string,
  aujourdhui: string,
): Statistiques {
  const triees = [...pesees].sort((a, b) => a.mesure_le.localeCompare(b.mesure_le));
  const derniere = triees.at(-1);

  const limite = decalerJour(aujourdhui, -7);
  const reference = [...triees].reverse().find((p) => p.mesure_le <= limite);
  const variation7JoursKg =
    derniere && reference ? Math.round((derniere.poids_kg - reference.poids_kg) * 10) / 10 : null;

  // Jours pris en compte : les 7 derniers, sans remonter avant le début du suivi.
  const premierJour = debutSuivi > decalerJour(aujourdhui, -6) ? debutSuivi : decalerJour(aujourdhui, -6);
  const nombreJours = joursEntre(premierJour, aujourdhui) + 1;
  const totaux = totalParJour(prises.filter((p) => p.jour >= premierJour && p.jour <= aujourdhui));
  const totalEau = [...totaux.values()].reduce((somme, ml) => somme + ml, 0);

  return {
    joursDeSuivi: Math.max(1, joursEntre(debutSuivi, aujourdhui) + 1),
    nombrePesees: triees.length,
    variation7JoursKg,
    moyenneEau7JoursMl: totaux.size === 0 ? null : Math.round(totalEau / Math.max(1, nombreJours)),
  };
}
