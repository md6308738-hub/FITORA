import { z } from "zod";

const vide = (valeur: unknown) =>
  valeur === "" || valeur === null || valeur === undefined || Number.isNaN(valeur);

/** Champ numérique obligatoire saisi dans un input (chaîne → nombre). */
function nombre(min: number, max: number, requis: string, unite: string) {
  const horsLimites = `Indiquez une valeur entre ${min} et ${max} ${unite}.`;
  return z.preprocess(
    (v) => (vide(v) ? undefined : Number(String(v).replace(",", "."))),
    z.number({ error: requis }).min(min, horsLimites).max(max, horsLimites),
  );
}

function nombreOptionnel(min: number, max: number, message: string) {
  return z.preprocess(
    (v) => (vide(v) ? undefined : Number(String(v).replace(",", "."))),
    z.number({ error: message }).min(min, message).max(max, message).optional(),
  );
}

function choix<const V extends readonly [string, ...string[]]>(valeurs: V, message: string) {
  return z.preprocess((v) => (vide(v) ? undefined : v), z.enum(valeurs, { error: message }));
}

function choixOptionnel<const V extends readonly [string, ...string[]]>(valeurs: V) {
  return z.preprocess((v) => (vide(v) ? undefined : v), z.enum(valeurs).optional());
}

/** Groupe de cases à cocher : React Hook Form renvoie false, une chaîne ou un tableau. */
function choixMultiples<const V extends readonly [string, ...string[]]>(valeurs: V) {
  return z.preprocess(
    (v) => (Array.isArray(v) ? v : typeof v === "string" ? [v] : []),
    z.array(z.enum(valeurs)),
  );
}

function texteOptionnel(max = 500) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max, `${max} caractères maximum.`).optional(),
  );
}

export const ETAPES = [
  {
    id: "mensurations",
    titre: "Parlons de vous",
    description: "Ces mesures servent à estimer vos besoins et suivre votre progression.",
    facultative: false,
    schema: z.object({
      age: nombre(14, 100, "Indiquez votre âge.", "ans"),
      sexe: choixOptionnel(["femme", "homme", "autre"]),
      taille_cm: nombre(120, 230, "Indiquez votre taille.", "cm"),
      poids_kg: nombre(30, 300, "Indiquez votre poids actuel.", "kg"),
    }),
  },
  {
    id: "objectif",
    titre: "Votre objectif",
    description: "Il oriente vos entraînements et vos recommandations nutritionnelles.",
    facultative: false,
    schema: z.object({
      objectif: choix(
        ["prise_de_masse", "perte_de_poids", "force", "endurance", "maintien"],
        "Choisissez votre objectif principal.",
      ),
      poids_objectif_kg: nombreOptionnel(30, 300, "Le poids objectif doit être compris entre 30 et 300 kg."),
    }),
  },
  {
    id: "niveau",
    titre: "Votre niveau",
    description: "Soyez honnête : le programme s’adaptera ensuite à vos progrès.",
    facultative: false,
    schema: z.object({
      niveau: choix(["debutant", "intermediaire", "avance"], "Choisissez votre niveau."),
    }),
  },
  {
    id: "activites",
    titre: "Vos activités",
    description: "Sélectionnez une ou plusieurs activités.",
    facultative: false,
    schema: z.object({
      activites: choixMultiples(["musculation", "fitness", "cardio", "domicile"]).refine(
        (liste) => liste.length > 0,
        "Choisissez au moins une activité.",
      ),
    }),
  },
  {
    id: "disponibilites",
    titre: "Vos disponibilités",
    description: "Combien de temps pouvez-vous consacrer à l’entraînement ?",
    facultative: false,
    schema: z.object({
      jours_par_semaine: z.preprocess(
        (v) => (vide(v) ? undefined : Number(v)),
        z.number({ error: "Choisissez un nombre de jours." }).int().min(1).max(7),
      ),
      duree_seance_min: z.preprocess(
        (v) => (vide(v) ? undefined : Number(v)),
        z.number({ error: "Choisissez une durée de séance." }).int().min(15).max(180),
      ),
    }),
  },
  {
    id: "materiel",
    titre: "Votre matériel",
    description: "Où et avec quoi allez-vous vous entraîner ?",
    facultative: false,
    schema: z.object({
      materiel: choix(["salle", "domicile", "aucun"], "Choisissez le matériel disponible."),
    }),
  },
  {
    id: "experience",
    titre: "Votre expérience",
    description: "Facultatif : aidez-nous à mieux cibler vos séances.",
    facultative: true,
    schema: z.object({
      experience: texteOptionnel(),
      exercices_preferes: texteOptionnel(),
    }),
  },
  {
    id: "alimentation",
    titre: "Votre alimentation",
    description: "Facultatif : pour des conseils nutritionnels adaptés.",
    facultative: true,
    schema: z.object({
      restrictions_alimentaires: choixMultiples([
        "vegetarien",
        "vegan",
        "halal",
        "sans_gluten",
        "sans_lactose",
      ]),
      allergies: texteOptionnel(),
      budget_alimentaire: choixOptionnel(["serre", "moyen", "confortable"]),
      aliments_preferes: texteOptionnel(),
    }),
  },
  {
    id: "mode-de-vie",
    titre: "Votre mode de vie",
    description: "Le repos et l’activité quotidienne comptent autant que l’entraînement.",
    facultative: false,
    schema: z.object({
      sommeil_heures: nombreOptionnel(3, 14, "Indiquez une durée de sommeil entre 3 et 14 heures."),
      niveau_activite: choix(
        ["sedentaire", "leger", "modere", "eleve", "tres_eleve"],
        "Choisissez votre niveau d’activité quotidienne.",
      ),
      blessures: texteOptionnel(),
    }),
  },
] as const;

export type Etape = (typeof ETAPES)[number];
export type EtapeId = Etape["id"];
export const NOMBRE_ETAPES = ETAPES.length;
