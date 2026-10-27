/**
 * Signaux de récupération (cahier des charges § 12.3 et § 15.3) : on recommande le repos
 * ou l'avis d'un professionnel, sans jamais établir de diagnostic ni pousser à s'entraîner.
 */
export type SignalSante = { niveau: "attention" | "consulter"; message: string };

export function signauxSante(entree: { fatigue: number | null; douleurIntensite: number | null; sommeilMin: number | null } | null): SignalSante[] {
  if (!entree) return [];
  const signaux: SignalSante[] = [];
  if ((entree.douleurIntensite ?? 0) >= 7) {
    signaux.push({ niveau: "consulter", message: "Douleur importante signalée : ne t’entraîne pas sur la zone douloureuse et consulte un professionnel de santé si elle persiste." });
  } else if ((entree.douleurIntensite ?? 0) >= 4) {
    signaux.push({ niveau: "attention", message: "Douleur modérée signalée : allège ou remplace les exercices qui la réveillent." });
  }
  if (entree.fatigue === 5) {
    signaux.push({ niveau: "attention", message: "Fatigue très élevée : une journée de repos ou une séance légère est préférable aujourd’hui." });
  }
  if (entree.sommeilMin !== null && entree.sommeilMin < 300) {
    signaux.push({ niveau: "attention", message: "Nuit courte (moins de 5 h) : privilégie la récupération plutôt que l’intensité." });
  }
  return signaux;
}
