import { z } from "zod";

import type { BudgetAlimentaire, MomentRepas, RestrictionAlimentaire } from "@/types/database";

import { ALIMENTS, apports, somme, trouverAliment, type Aliment, type Allergene, type Apports, type Categorie, type Regime } from "./aliments";

/**
 * Générateur de plans de repas (cahier des charges § 11.4) : règles déterministes,
 * sans régime extrême, qui respectent restrictions, allergies et budget déclarés.
 */

export type ParametresPlan = {
  kcalCible: number;
  proteinesCibleG: number;
  restrictions: readonly RestrictionAlimentaire[];
  allergies: string | null;
  budget: BudgetAlimentaire | null;
  alimentsPreferes: string | null;
  variante?: number;
};

export const elementSchema = z.object({ alimentId: z.string(), grammes: z.number().positive() });
export const repasSchema = z.object({ moment: z.enum(["petit_dejeuner", "dejeuner", "diner", "collation"]), elements: z.array(elementSchema) });
export const jourSchema = z.object({ jour: z.number().int().min(1).max(7), repas: z.array(repasSchema) });
export const planSchema = z.object({ jours: z.array(jourSchema).length(7), avertissements: z.array(z.string()) });
export type Plan = z.infer<typeof planSchema>;

/** Mots-clés d'allergies reconnus dans le texte libre du profil. */
const MOTS_ALLERGIES: { motif: RegExp; allergene: Allergene }[] = [
  { motif: /arachide|cacahu[eè]te/i, allergene: "arachide" },
  { motif: /poisson/i, allergene: "poisson" },
  { motif: /crevette|crustac|fruits? de mer/i, allergene: "crustaces" },
  { motif: /\b(?:oeufs?|œufs?)\b/i, allergene: "oeuf" },
  { motif: /lait|lactose|laitier/i, allergene: "lait" },
  { motif: /gluten|bl[ée]/i, allergene: "gluten" },
];

export function allergenesDepuisTexte(texte: string | null): { allergenes: Allergene[]; nonReconnu: boolean } {
  if (!texte || texte.trim() === "") return { allergenes: [], nonReconnu: false };
  const allergenes = MOTS_ALLERGIES.filter((m) => m.motif.test(texte)).map((m) => m.allergene);
  return { allergenes, nonReconnu: allergenes.length === 0 };
}

/** Aliments autorisés selon restrictions, allergies et budget. */
export function alimentsAutorises(p: Pick<ParametresPlan, "restrictions" | "allergies" | "budget">): Aliment[] {
  const regimes = p.restrictions.filter((r): r is Regime => r !== "halal");
  const { allergenes } = allergenesDepuisTexte(p.allergies);
  return ALIMENTS.filter(
    (a) =>
      regimes.every((r) => a.regimes.includes(r)) &&
      !a.allergenes.some((al) => allergenes.includes(al)) &&
      !(p.budget === "serre" && a.cout === "eleve"),
  );
}

type Emplacement = { categories: Categorie[]; role: "energie" | "proteine" | "fixe"; grammes?: number };

const MODELES: Record<MomentRepas, { part: number; emplacements: Emplacement[] }> = {
  petit_dejeuner: { part: 0.25, emplacements: [{ categories: ["petit_dejeuner"], role: "energie" }, { categories: ["laitier", "proteine", "legumineuse"], role: "proteine" }, { categories: ["fruit"], role: "fixe", grammes: 150 }] },
  dejeuner: { part: 0.35, emplacements: [{ categories: ["feculent"], role: "energie" }, { categories: ["proteine", "legumineuse"], role: "proteine" }, { categories: ["legume"], role: "fixe", grammes: 120 }, { categories: ["legume"], role: "fixe", grammes: 80 }, { categories: ["matiere_grasse"], role: "fixe", grammes: 10 }] },
  diner: { part: 0.3, emplacements: [{ categories: ["feculent"], role: "energie" }, { categories: ["proteine", "legumineuse"], role: "proteine" }, { categories: ["legume"], role: "fixe", grammes: 150 }, { categories: ["matiere_grasse"], role: "fixe", grammes: 5 }] },
  collation: { part: 0.1, emplacements: [{ categories: ["fruit", "laitier", "legumineuse"], role: "energie" }] },
};

const arrondir10 = (g: number) => Math.max(10, Math.round(g / 10) * 10);
const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function genererPlan(p: ParametresPlan): Plan {
  const autorises = alimentsAutorises(p);
  const preferes = (p.alimentsPreferes ?? "").toLowerCase();
  const estPrefere = (a: Aliment) => preferes.length > 0 && preferes.includes(a.nom.split(" ")[0]?.toLowerCase() ?? "§");
  // Préférés d'abord, puis coût bas si le budget est serré ; ordre stable sinon.
  const tries = [...autorises].sort((a, b) => Number(estPrefere(b)) - Number(estPrefere(a)) || (p.budget === "serre" ? (a.cout === "bas" ? -1 : 1) - (b.cout === "bas" ? -1 : 1) : 0));
  const variante = p.variante ?? 0;

  const jours = Array.from({ length: 7 }, (_, j) => {
    const repas = (Object.keys(MODELES) as MomentRepas[]).map((moment, m) => {
      const modele = MODELES[moment];
      const kcalRepas = p.kcalCible * modele.part;
      const choisis: { aliment: Aliment; emplacement: Emplacement }[] = [];
      modele.emplacements.forEach((emplacement, e) => {
        const options = tries.filter((a) => emplacement.categories.includes(a.categorie) && !choisis.some((c) => c.aliment.id === a.id));
        if (options.length === 0) return;
        const aliment = options[(j * 3 + m * 2 + e + variante) % options.length] as Aliment;
        choisis.push({ aliment, emplacement });
      });

      // Quantités : fixes, puis protéines selon la cible, puis l'énergie complète le repas.
      const elements = choisis.map(({ aliment, emplacement }) => {
        let grammes = emplacement.grammes ?? aliment.portion.grammes;
        if (emplacement.role === "proteine" && aliment.proteines > 0) {
          const cible = (p.proteinesCibleG * modele.part) / (aliment.proteines / 100);
          grammes = borner(cible, aliment.portion.grammes * 0.5, aliment.portion.grammes * 2);
        }
        return { aliment, emplacement, grammes };
      });
      const kcalHorsEnergie = elements.filter((e) => e.emplacement.role !== "energie").reduce((t, e) => t + apports(e.aliment, e.grammes).kcal, 0);
      for (const e of elements.filter((x) => x.emplacement.role === "energie")) {
        const restant = Math.max(0, kcalRepas - kcalHorsEnergie);
        e.grammes = borner(restant / (e.aliment.kcal / 100), e.aliment.portion.grammes * 0.5, e.aliment.portion.grammes * 2.5);
      }
      return { moment, elements: elements.map((e) => ({ alimentId: e.aliment.id, grammes: arrondir10(e.grammes) })) };
    });
    return { jour: j + 1, repas };
  });

  const avertissements: string[] = [];
  const { nonReconnu } = allergenesDepuisTexte(p.allergies);
  if (nonReconnu) {
    avertissements.push("Ton allergie n’a pas été reconnue automatiquement : vérifie chaque aliment du plan.");
  }
  if (p.restrictions.includes("halal")) {
    avertissements.push("Halal : le plan ne contient pas de porc ; vérifie la certification des viandes à l’achat.");
  }
  if (p.allergies) {
    avertissements.push("En cas d’allergie sévère ou de restriction médicale, fais valider ton alimentation par un professionnel de santé.");
  }
  return { jours, avertissements };
}

/** Apports d'un repas ou d'une journée. */
export function apportsElements(elements: readonly { alimentId: string; grammes: number }[]): Apports {
  return somme(
    elements.flatMap((e) => {
      const aliment = trouverAliment(e.alimentId);
      return aliment ? [apports(aliment, e.grammes)] : [];
    }),
  );
}

/** Liste de courses : quantités cumulées sur 7 jours, regroupées par catégorie. */
export function listeDeCourses(plan: Plan): { categorie: Categorie; articles: { alimentId: string; nom: string; grammes: number }[] }[] {
  const totaux = new Map<string, number>();
  for (const jour of plan.jours) for (const repas of jour.repas) for (const e of repas.elements) totaux.set(e.alimentId, (totaux.get(e.alimentId) ?? 0) + e.grammes);
  const parCategorie = new Map<Categorie, { alimentId: string; nom: string; grammes: number }[]>();
  for (const [alimentId, grammes] of totaux) {
    const aliment = trouverAliment(alimentId);
    if (!aliment) continue;
    const liste = parCategorie.get(aliment.categorie) ?? [];
    liste.push({ alimentId, nom: aliment.nom, grammes });
    parCategorie.set(aliment.categorie, liste);
  }
  return [...parCategorie.entries()].map(([categorie, articles]) => ({ categorie, articles: articles.sort((a, b) => b.grammes - a.grammes) }));
}
