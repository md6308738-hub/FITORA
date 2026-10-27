import { decalerJour, joursEntre } from "@/lib/dates";
import type { TypeObjectif } from "@/types/database";

/** Lundi (AAAA-MM-JJ) de la semaine contenant ce jour. */
export function lundiDe(jour: string): string {
  const date = new Date(`${jour}T12:00:00Z`);
  const decalage = (date.getUTCDay() + 6) % 7;
  return decalerJour(jour, -decalage);
}

/** Nombre de séances par semaine sur les `semaines` dernières semaines (semaine en cours incluse). */
export function seancesParSemaine(
  jours: readonly string[],
  aujourdhui: string,
  semaines = 12,
): { semaine: string; nombre: number }[] {
  const derniere = lundiDe(aujourdhui);
  const resultat = Array.from({ length: semaines }, (_, i) => ({ semaine: decalerJour(derniere, -7 * (semaines - 1 - i)), nombre: 0 }));
  for (const jour of jours) {
    const ligne = resultat.find((r) => r.semaine === lundiDe(jour));
    if (ligne) ligne.nombre += 1;
  }
  return resultat;
}

/** Part des semaines terminées où l'objectif de séances a été atteint (null sans recul). */
export function regularite(parSemaine: readonly { nombre: number }[], cible: number): number | null {
  const terminees = parSemaine.slice(0, -1); // la semaine en cours n'est pas finie
  if (terminees.length === 0 || cible <= 0) return null;
  return Math.round((terminees.filter((s) => s.nombre >= cible).length / terminees.length) * 100);
}

/** Meilleure charge enregistrée par exercice. */
export function meilleuresCharges(
  series: readonly { exercice_id: string; charge_kg: number | null; repetitions: number | null }[],
): { exerciceId: string; chargeKg: number; repetitions: number }[] {
  const meilleures = new Map<string, { chargeKg: number; repetitions: number }>();
  for (const s of series) {
    if (!s.charge_kg || s.charge_kg <= 0) continue;
    const actuelle = meilleures.get(s.exercice_id);
    if (!actuelle || s.charge_kg > actuelle.chargeKg || (s.charge_kg === actuelle.chargeKg && (s.repetitions ?? 0) > actuelle.repetitions)) {
      meilleures.set(s.exercice_id, { chargeKg: s.charge_kg, repetitions: s.repetitions ?? 0 });
    }
  }
  return [...meilleures.entries()]
    .map(([exerciceId, v]) => ({ exerciceId, ...v }))
    .sort((a, b) => b.chargeKg - a.chargeKg);
}

/** Points d'une série temporelle sur les `jours` derniers jours. */
export function surPeriode<T extends { jour: string }>(points: readonly T[], aujourdhui: string, jours: number): T[] {
  const debut = decalerJour(aujourdhui, -(jours - 1));
  return points.filter((p) => p.jour >= debut && p.jour <= aujourdhui);
}

export type DonneesObjectif = {
  poidsDepart: number | null;
  poidsActuel: number | null;
  seancesCetteSemaine: number;
  eauAujourdhuiMl: number;
  pasAujourdhui: number | null;
};

/**
 * Avancement d'un objectif (0–100), calculé uniquement sur des données enregistrées.
 * null quand la donnée nécessaire manque.
 */
export function avancementObjectif(type: TypeObjectif, cible: number, d: DonneesObjectif): number | null {
  const borner = (v: number) => Math.round(Math.min(100, Math.max(0, v)));
  switch (type) {
    case "poids": {
      if (d.poidsDepart === null || d.poidsActuel === null) return null;
      const total = cible - d.poidsDepart;
      if (total === 0) return d.poidsActuel === cible ? 100 : 0;
      return borner(((d.poidsActuel - d.poidsDepart) / total) * 100);
    }
    case "seances_semaine":
      return borner((d.seancesCetteSemaine / cible) * 100);
    case "hydratation":
      return borner((d.eauAujourdhuiMl / cible) * 100);
    case "pas":
      return d.pasAujourdhui === null ? null : borner((d.pasAujourdhui / cible) * 100);
  }
}

export type Bilan = {
  seances: number;
  seancesPrevues: number | null;
  variationPoidsKg: number | null;
  joursHydratationAtteinte: number;
  joursAvecDonneesEau: number;
  objectifsAtteints: number;
  aAmeliorer: string[];
  propositions: string[];
};

/** Bilan d'une période (le mois en cours), fondé uniquement sur ce qui a été enregistré. */
export function bilanPeriode(entree: {
  debut: string;
  fin: string;
  joursSeances: readonly string[];
  seancesParSemaineCible: number | null;
  pesees: readonly { jour: string; poids: number }[];
  eauParJour: ReadonlyMap<string, number>;
  objectifEauMl: number | null;
  objectifsAtteints: number;
}): Bilan {
  const { debut, fin } = entree;
  const dansPeriode = (jour: string) => jour >= debut && jour <= fin;
  const seances = entree.joursSeances.filter(dansPeriode).length;
  const semaines = Math.max(1, (joursEntre(debut, fin) + 1) / 7);
  const seancesPrevues = entree.seancesParSemaineCible ? Math.round(entree.seancesParSemaineCible * semaines) : null;

  const pesees = entree.pesees.filter((p) => dansPeriode(p.jour)).sort((a, b) => a.jour.localeCompare(b.jour));
  const premiere = pesees[0];
  const derniere = pesees.at(-1);
  const variationPoidsKg = premiere && derniere && pesees.length > 1 ? Math.round((derniere.poids - premiere.poids) * 10) / 10 : null;

  const joursEau = [...entree.eauParJour.entries()].filter(([jour]) => dansPeriode(jour));
  const joursHydratationAtteinte = entree.objectifEauMl ? joursEau.filter(([, ml]) => ml >= (entree.objectifEauMl ?? 0)).length : 0;

  const aAmeliorer: string[] = [];
  const propositions: string[] = [];
  if (seancesPrevues !== null && seances < seancesPrevues) {
    aAmeliorer.push(`Régularité : ${seances} séance${seances > 1 ? "s" : ""} sur ${seancesPrevues} prévues.`);
    propositions.push(`Viser ${entree.seancesParSemaineCible} séances par semaine en bloquant les créneaux à l’avance.`);
  }
  if (pesees.length < 4) {
    aAmeliorer.push("Peu de pesées enregistrées : la tendance du poids est difficile à lire.");
    propositions.push("Te peser une fois par semaine, le même jour et dans les mêmes conditions.");
  }
  if (entree.objectifEauMl && joursEau.length > 0 && joursHydratationAtteinte < joursEau.length / 2) {
    aAmeliorer.push("Hydratation : repère quotidien atteint moins d’un jour sur deux.");
    propositions.push("Garder une bouteille d’eau à portée de main pendant la journée.");
  }

  return {
    seances,
    seancesPrevues,
    variationPoidsKg,
    joursHydratationAtteinte,
    joursAvecDonneesEau: joursEau.length,
    objectifsAtteints: entree.objectifsAtteints,
    aAmeliorer,
    propositions,
  };
}
