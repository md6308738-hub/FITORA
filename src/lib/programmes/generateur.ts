import { joursEntrainement } from "@/lib/calculs/planning";
import {
  CATALOGUE,
  MOTIFS_POLYARTICULAIRES,
  ORDRE_NIVEAU,
  type Exercice,
  type Materiel,
  type Motif,
} from "@/lib/exercices/catalogue";
import type { MaterielDisponible, NiveauSportif, ObjectifPrincipal } from "@/types/database";

/**
 * Générateur de programmes : règles déterministes (aucune IA), fondées sur l'objectif,
 * le niveau, les disponibilités et le matériel déclarés.
 */

export type ParametresProgramme = {
  objectif: ObjectifPrincipal;
  niveau: NiveauSportif;
  joursParSemaine: number;
  dureeSeanceMin: number;
  materiel: MaterielDisponible;
  blessures: string | null;
  /** Change le choix des exercices pour proposer une autre version. */
  variante?: number;
};

export type ExercicePrescrit = {
  exerciceId: string;
  series: number;
  repsMin: number | null;
  repsMax: number | null;
  dureeSec: number | null;
  reposSec: number;
};

export type SeanceProposee = { nom: string; jourSemaine: number; exercices: ExercicePrescrit[] };

export type ProgrammePropose = {
  titre: string;
  seances: SeanceProposee[];
  avertissements: string[];
};

/** Matériel accessible selon le lieu d'entraînement déclaré. */
export const MATERIEL_PAR_LIEU: Record<MaterielDisponible, readonly Materiel[]> = {
  salle: ["poids_du_corps", "halteres", "barre", "banc", "poulie", "machine", "elastique", "barre_traction", "tapis_course", "velo"],
  domicile: ["poids_du_corps", "halteres", "elastique"],
  aucun: ["poids_du_corps"],
};

type Gabarit = { nom: string; motifs: Motif[] };

const G = {
  corpsA: { nom: "Corps entier A", motifs: ["squat", "poussee_horizontale", "tirage_horizontal", "charniere", "poussee_verticale", "gainage", "biceps", "triceps"] },
  corpsB: { nom: "Corps entier B", motifs: ["charniere", "poussee_verticale", "tirage_vertical", "fente", "poussee_horizontale", "gainage", "triceps", "biceps"] },
  corpsC: { nom: "Corps entier C", motifs: ["fente", "poussee_horizontale", "tirage_vertical", "squat", "epaules_isolation", "gainage", "biceps"] },
  hautA: { nom: "Haut du corps A", motifs: ["poussee_horizontale", "tirage_horizontal", "poussee_verticale", "tirage_vertical", "epaules_isolation", "biceps", "triceps"] },
  hautB: { nom: "Haut du corps B", motifs: ["poussee_verticale", "tirage_vertical", "poussee_horizontale", "tirage_horizontal", "triceps", "biceps", "epaules_isolation"] },
  basA: { nom: "Bas du corps A", motifs: ["squat", "charniere", "fente", "mollets", "gainage", "gainage"] },
  basB: { nom: "Bas du corps B", motifs: ["charniere", "squat", "fente", "mollets", "gainage"] },
  poussee: { nom: "Poussée", motifs: ["poussee_horizontale", "poussee_verticale", "poussee_horizontale", "epaules_isolation", "triceps", "triceps"] },
  tirage: { nom: "Tirage", motifs: ["tirage_vertical", "tirage_horizontal", "tirage_horizontal", "biceps", "biceps", "gainage"] },
  jambes: { nom: "Jambes", motifs: ["squat", "charniere", "fente", "mollets", "gainage"] },
  cardio: { nom: "Cardio et gainage", motifs: ["cardio", "gainage", "cardio", "gainage"] },
} satisfies Record<string, Gabarit>;

/** Répartition des séances selon le nombre de jours et le niveau. */
export function repartition(jours: number, niveau: NiveauSportif): Gabarit[] {
  switch (Math.min(7, Math.max(1, jours))) {
    case 1:
      return [G.corpsA];
    case 2:
      return [G.corpsA, G.corpsB];
    case 3:
      return niveau === "debutant" ? [G.corpsA, G.corpsB, G.corpsC] : [G.poussee, G.tirage, G.jambes];
    case 4:
      return [G.hautA, G.basA, G.hautB, G.basB];
    case 5:
      return [G.poussee, G.tirage, G.jambes, G.hautA, G.basB];
    case 6:
      return [G.poussee, G.tirage, G.jambes, { ...G.poussee, nom: "Poussée B" }, { ...G.tirage, nom: "Tirage B" }, { ...G.jambes, nom: "Jambes B" }];
    default:
      return [G.poussee, G.tirage, G.jambes, G.hautA, G.basB, G.corpsC, G.cardio];
  }
}

/** Nombre d'exercices tenant dans la durée de séance (échauffement compris). */
export function nombreExercices(dureeMin: number): number {
  return Math.min(8, Math.max(3, Math.floor((dureeMin - 10) / 7)));
}

type Schema = { series: number; repsMin: number; repsMax: number; reposSec: number };

const SCHEMAS: Record<ObjectifPrincipal, { poly: Schema; iso: Schema }> = {
  prise_de_masse: { poly: { series: 4, repsMin: 6, repsMax: 10, reposSec: 120 }, iso: { series: 3, repsMin: 10, repsMax: 15, reposSec: 60 } },
  force: { poly: { series: 5, repsMin: 3, repsMax: 5, reposSec: 180 }, iso: { series: 3, repsMin: 8, repsMax: 12, reposSec: 90 } },
  perte_de_poids: { poly: { series: 3, repsMin: 10, repsMax: 12, reposSec: 60 }, iso: { series: 3, repsMin: 12, repsMax: 15, reposSec: 45 } },
  endurance: { poly: { series: 3, repsMin: 12, repsMax: 15, reposSec: 45 }, iso: { series: 2, repsMin: 15, repsMax: 20, reposSec: 30 } },
  maintien: { poly: { series: 3, repsMin: 8, repsMax: 12, reposSec: 90 }, iso: { series: 3, repsMin: 10, repsMax: 15, reposSec: 60 } },
};

const DUREE_GAINAGE: Record<NiveauSportif, number> = { debutant: 30, intermediaire: 45, avance: 60 };

/** Prescription (séries, répétitions ou durée, repos) d'un exercice dans le contexte du programme. */
export function prescrire(exercice: Exercice, objectif: ObjectifPrincipal, niveau: NiveauSportif): ExercicePrescrit {
  if (exercice.mesure === "duree") {
    const machine = exercice.materiel.some((m) => m === "tapis_course" || m === "velo");
    if (machine) {
      return { exerciceId: exercice.id, series: 1, repsMin: null, repsMax: null, dureeSec: niveau === "debutant" ? 600 : 900, reposSec: 0 };
    }
    return { exerciceId: exercice.id, series: 3, repsMin: null, repsMax: null, dureeSec: DUREE_GAINAGE[niveau], reposSec: 30 };
  }
  const poly = exercice.motifs.some((m) => MOTIFS_POLYARTICULAIRES.includes(m));
  const schema = SCHEMAS[objectif][poly ? "poly" : "iso"];
  // Débutant : une série de moins sur les mouvements lourds pour apprendre la technique.
  const series = niveau === "debutant" && poly ? Math.max(2, schema.series - 1) : schema.series;
  return { exerciceId: exercice.id, series, repsMin: schema.repsMin, repsMax: schema.repsMax, dureeSec: null, reposSec: schema.reposSec };
}

/** Exercices réalisables pour un schéma de mouvement, du plus exigeant accessible au plus simple. */
export function candidats(motif: Motif, materiel: MaterielDisponible, niveau: NiveauSportif): Exercice[] {
  const disponible = MATERIEL_PAR_LIEU[materiel];
  return CATALOGUE.filter(
    (e) =>
      e.motifs.includes(motif) &&
      e.materiel.every((m) => disponible.includes(m)) &&
      ORDRE_NIVEAU[e.niveau] <= ORDRE_NIVEAU[niveau],
  ).sort((a, b) => ORDRE_NIVEAU[b.niveau] - ORDRE_NIVEAU[a.niveau]);
}

const LIBELLE_OBJECTIF: Record<ObjectifPrincipal, string> = {
  prise_de_masse: "Prise de masse",
  perte_de_poids: "Perte de poids",
  force: "Force",
  endurance: "Endurance",
  maintien: "Maintien",
};

export function genererProgramme(parametres: ParametresProgramme): ProgrammePropose {
  const { objectif, niveau, joursParSemaine, dureeSeanceMin, materiel, blessures, variante = 0 } = parametres;
  const jours = joursEntrainement(joursParSemaine);
  const gabarits = repartition(joursParSemaine, niveau);
  const maxExercices = nombreExercices(dureeSeanceMin);
  const avecCardio = objectif === "perte_de_poids" || objectif === "endurance";
  const utilisations = new Map<string, number>();

  const seances = gabarits.map((gabarit, index) => {
    const motifs = avecCardio && !gabarit.motifs.includes("cardio")
      ? [...gabarit.motifs.slice(0, maxExercices - 1), "cardio" as const]
      : gabarit.motifs.slice(0, maxExercices);
    const dejaDansLaSeance = new Set<string>();
    const exercices: ExercicePrescrit[] = [];

    for (const motif of motifs) {
      const liste = candidats(motif, materiel, niveau).filter((e) => !dejaDansLaSeance.has(e.id));
      if (liste.length === 0) continue;
      // Les moins utilisés d'abord (variété entre séances), puis rotation selon la variante.
      const minimum = Math.min(...liste.map((e) => utilisations.get(e.id) ?? 0));
      const moinsUtilises = liste.filter((e) => (utilisations.get(e.id) ?? 0) === minimum);
      const choisi = moinsUtilises[(variante + index) % moinsUtilises.length] as Exercice;
      dejaDansLaSeance.add(choisi.id);
      utilisations.set(choisi.id, (utilisations.get(choisi.id) ?? 0) + 1);
      exercices.push(prescrire(choisi, objectif, niveau));
    }

    return { nom: gabarit.nom, jourSemaine: jours[index] ?? index + 1, exercices };
  });

  const avertissements: string[] = [];
  if (blessures && blessures.trim().length > 0) {
    avertissements.push(
      "Tu as signalé une blessure ou une limitation : remplace tout exercice qui provoque une douleur et demande l’avis d’un professionnel de santé avant de reprendre.",
    );
  }
  if (materiel === "aucun") {
    avertissements.push("Sans matériel, les exercices de tirage sont limités : un élastique ou une barre de traction enrichirait le programme.");
  }

  const pluriel = joursParSemaine > 1 ? "s" : "";
  return {
    titre: `${LIBELLE_OBJECTIF[objectif]} · ${joursParSemaine} séance${pluriel} par semaine`,
    seances,
    avertissements,
  };
}

/**
 * Progression prudente (cahier des charges § 8.5) : si toutes les séries ont atteint le haut
 * de la plage de répétitions, on propose une petite hausse ; sinon on garde la charge.
 */
export function suggererCharge(
  series: readonly { chargeKg: number | null; repetitions: number | null }[],
  repsMax: number | null,
): { chargeKg: number | null; raison: string } | null {
  if (series.length === 0 || repsMax === null) return null;
  const derniereCharge = series.at(-1)?.chargeKg ?? null;
  const toutesReussies = series.every((s) => (s.repetitions ?? 0) >= repsMax);
  if (derniereCharge === null || derniereCharge === 0) {
    return toutesReussies
      ? { chargeKg: null, raison: "Objectif atteint : ajoute une répétition ou ralentis la descente." }
      : { chargeKg: null, raison: "Vise le haut de la plage de répétitions avant d’augmenter la difficulté." };
  }
  if (!toutesReussies) {
    return { chargeKg: derniereCharge, raison: "Garde la même charge jusqu’à réussir toutes les séries." };
  }
  const hausse = derniereCharge < 20 ? 1 : 2.5;
  return { chargeKg: Math.round((derniereCharge + hausse) * 10) / 10, raison: `Toutes les séries réussies : +${hausse} kg.` };
}
