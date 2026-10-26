import { describe, expect, it } from "vitest";

import { CATALOGUE, trouverExercice } from "@/lib/exercices/catalogue";

import {
  MATERIEL_PAR_LIEU,
  genererProgramme,
  nombreExercices,
  prescrire,
  suggererCharge,
  type ParametresProgramme,
} from "./generateur";

const base: ParametresProgramme = {
  objectif: "prise_de_masse",
  niveau: "intermediaire",
  joursParSemaine: 3,
  dureeSeanceMin: 60,
  materiel: "salle",
  blessures: null,
};

describe("catalogue", () => {
  it("a des identifiants uniques au bon format et des consignes pour chaque exercice", () => {
    const ids = CATALOGUE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const exercice of CATALOGUE) {
      expect(exercice.id).toMatch(/^[a-z0-9-]{2,60}$/);
      expect(exercice.consignes.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("genererProgramme", () => {
  it("respecte le nombre de jours et les jours répartis dans la semaine", () => {
    for (let jours = 1; jours <= 7; jours++) {
      const programme = genererProgramme({ ...base, joursParSemaine: jours });
      expect(programme.seances).toHaveLength(jours);
      const joursUtilises = programme.seances.map((s) => s.jourSemaine);
      expect(new Set(joursUtilises).size).toBe(jours);
    }
  });

  it("n'utilise que le matériel déclaré, pour chaque lieu", () => {
    for (const materiel of ["salle", "domicile", "aucun"] as const) {
      const programme = genererProgramme({ ...base, materiel, joursParSemaine: 4 });
      for (const seance of programme.seances) {
        for (const prescrit of seance.exercices) {
          const exercice = trouverExercice(prescrit.exerciceId);
          expect(exercice).toBeDefined();
          expect(exercice?.materiel.every((m) => MATERIEL_PAR_LIEU[materiel].includes(m))).toBe(true);
        }
      }
    }
  });

  it("ne propose pas d'exercice au-dessus du niveau déclaré", () => {
    const programme = genererProgramme({ ...base, niveau: "debutant", joursParSemaine: 3 });
    for (const seance of programme.seances) {
      for (const prescrit of seance.exercices) {
        expect(trouverExercice(prescrit.exerciceId)?.niveau).toBe("debutant");
      }
    }
  });

  it("adapte le volume à la durée de séance, sans doublon dans une séance", () => {
    for (const duree of [30, 45, 90]) {
      const programme = genererProgramme({ ...base, dureeSeanceMin: duree });
      for (const seance of programme.seances) {
        expect(seance.exercices.length).toBeLessThanOrEqual(nombreExercices(duree));
        expect(seance.exercices.length).toBeGreaterThan(0);
        const ids = seance.exercices.map((e) => e.exerciceId);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it("ajoute du cardio pour la perte de poids et l'endurance", () => {
    const programme = genererProgramme({ ...base, objectif: "perte_de_poids" });
    for (const seance of programme.seances) {
      const motifsCardio = seance.exercices.filter((e) => trouverExercice(e.exerciceId)?.motifs.includes("cardio"));
      expect(motifsCardio.length).toBeGreaterThan(0);
    }
  });

  it("est déterministe et la variante propose une autre sélection", () => {
    expect(genererProgramme(base)).toEqual(genererProgramme(base));
    const a = genererProgramme({ ...base, variante: 0 }).seances.flatMap((s) => s.exercices.map((e) => e.exerciceId));
    const b = genererProgramme({ ...base, variante: 1 }).seances.flatMap((s) => s.exercices.map((e) => e.exerciceId));
    expect(a).not.toEqual(b);
  });

  it("signale les blessures déclarées au lieu de les ignorer", () => {
    expect(genererProgramme({ ...base, blessures: "Douleur au genou droit" }).avertissements[0]).toContain("blessure");
    expect(genererProgramme(base).avertissements).toEqual([]);
  });
});

describe("prescrire", () => {
  it("applique des plages adaptées à l'objectif", () => {
    const squat = trouverExercice("squat-barre");
    if (!squat) throw new Error("exercice manquant");
    expect(prescrire(squat, "force", "avance")).toMatchObject({ series: 5, repsMin: 3, repsMax: 5, reposSec: 180 });
    expect(prescrire(squat, "prise_de_masse", "debutant").series).toBe(3);
    const planche = trouverExercice("planche");
    if (!planche) throw new Error("exercice manquant");
    expect(prescrire(planche, "maintien", "intermediaire")).toMatchObject({ dureeSec: 45, repsMin: null });
  });
});

describe("suggererCharge", () => {
  it("augmente prudemment seulement si toutes les séries sont réussies", () => {
    expect(suggererCharge([{ chargeKg: 40, repetitions: 10 }, { chargeKg: 40, repetitions: 10 }], 10)?.chargeKg).toBe(42.5);
    expect(suggererCharge([{ chargeKg: 12, repetitions: 12 }], 12)?.chargeKg).toBe(13);
    expect(suggererCharge([{ chargeKg: 40, repetitions: 10 }, { chargeKg: 40, repetitions: 8 }], 10)?.chargeKg).toBe(40);
    expect(suggererCharge([], 10)).toBeNull();
  });
});
