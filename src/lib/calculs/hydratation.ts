/** Repère d'hydratation quotidienne : environ 35 ml par kilo, borné et arrondi à 50 ml. */
export function objectifHydratationMl(poidsKg: number): number {
  const brut = Math.min(4000, Math.max(1500, poidsKg * 35));
  return Math.round(brut / 50) * 50;
}

/** Total bu par jour (AAAA-MM-JJ → ml). */
export function totalParJour(prises: readonly { jour: string; quantite_ml: number }[]): Map<string, number> {
  const totaux = new Map<string, number>();
  for (const prise of prises) {
    totaux.set(prise.jour, (totaux.get(prise.jour) ?? 0) + prise.quantite_ml);
  }
  return totaux;
}
