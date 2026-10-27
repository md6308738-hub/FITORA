/**
 * Catalogue alimentaire (cahier des charges § 11.3).
 * Valeurs pour 100 g de partie comestible, aliments cuits sauf mention contraire.
 * Ce sont des valeurs de référence usuelles, arrondies : elles restent indicatives et
 * doivent être confrontées à la Table de composition des aliments d'Afrique de l'Ouest
 * (FAO/INFOODS) avant toute utilisation diététique précise. Aucun prix n'est affiché :
 * seul un niveau de coût relatif sert à respecter le budget déclaré.
 */

export type Categorie = "feculent" | "legumineuse" | "proteine" | "laitier" | "legume" | "fruit" | "matiere_grasse" | "petit_dejeuner";
export type Allergene = "arachide" | "poisson" | "crustaces" | "oeuf" | "lait" | "gluten";
export type Regime = "vegetarien" | "vegan" | "sans_gluten" | "sans_lactose";

export type Aliment = {
  id: string;
  nom: string;
  categorie: Categorie;
  kcal: number;
  proteines: number;
  glucides: number;
  lipides: number;
  allergenes: readonly Allergene[];
  /** Régimes compatibles. */
  regimes: readonly Regime[];
  cout: "bas" | "moyen" | "eleve";
  /** Portion de référence en grammes et son libellé. */
  portion: { grammes: number; libelle: string };
};

const VEG: readonly Regime[] = ["vegetarien", "vegan", "sans_gluten", "sans_lactose"];
const VEG_GLUTEN: readonly Regime[] = ["vegetarien", "vegan", "sans_lactose"];
const ANIMAL: readonly Regime[] = ["sans_gluten", "sans_lactose"];
const OVO_LACTO: readonly Regime[] = ["vegetarien", "sans_gluten"];

export const ALIMENTS: readonly Aliment[] = [
  // Féculents et céréales
  { id: "riz-blanc", nom: "Riz blanc cuit", categorie: "feculent", kcal: 130, proteines: 2.7, glucides: 28, lipides: 0.3, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 200, libelle: "1 assiette" } },
  { id: "thiere", nom: "Couscous de mil (thiéré) cuit", categorie: "feculent", kcal: 112, proteines: 3.2, glucides: 23, lipides: 0.9, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 200, libelle: "1 assiette" } },
  { id: "fonio", nom: "Fonio cuit", categorie: "feculent", kcal: 105, proteines: 1.9, glucides: 23, lipides: 0.3, allergenes: [], regimes: VEG, cout: "moyen", portion: { grammes: 200, libelle: "1 assiette" } },
  { id: "patate-douce", nom: "Patate douce cuite", categorie: "feculent", kcal: 90, proteines: 2, glucides: 21, lipides: 0.1, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 150, libelle: "1 moyenne" } },
  { id: "manioc", nom: "Manioc bouilli", categorie: "feculent", kcal: 112, proteines: 1.4, glucides: 27, lipides: 0.3, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "igname", nom: "Igname cuite", categorie: "feculent", kcal: 116, proteines: 1.5, glucides: 27.5, lipides: 0.1, allergenes: [], regimes: VEG, cout: "moyen", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "plantain", nom: "Banane plantain cuite", categorie: "feculent", kcal: 116, proteines: 0.8, glucides: 31, lipides: 0.2, allergenes: [], regimes: VEG, cout: "moyen", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "pommes-de-terre", nom: "Pommes de terre cuites", categorie: "feculent", kcal: 87, proteines: 1.9, glucides: 20, lipides: 0.1, allergenes: [], regimes: VEG, cout: "moyen", portion: { grammes: 200, libelle: "2 moyennes" } },
  { id: "pates", nom: "Pâtes cuites", categorie: "feculent", kcal: 158, proteines: 5.8, glucides: 31, lipides: 0.9, allergenes: ["gluten"], regimes: VEG_GLUTEN, cout: "bas", portion: { grammes: 200, libelle: "1 assiette" } },
  // Petit-déjeuner
  { id: "pain", nom: "Pain (baguette)", categorie: "petit_dejeuner", kcal: 270, proteines: 9, glucides: 55, lipides: 1.5, allergenes: ["gluten"], regimes: VEG_GLUTEN, cout: "bas", portion: { grammes: 80, libelle: "1/3 de baguette" } },
  { id: "flocons-avoine", nom: "Flocons d’avoine (crus)", categorie: "petit_dejeuner", kcal: 379, proteines: 13, glucides: 67, lipides: 6.5, allergenes: ["gluten"], regimes: VEG_GLUTEN, cout: "moyen", portion: { grammes: 50, libelle: "1 bol" } },
  { id: "bouillie-mil", nom: "Bouillie de mil (fondé, sans sucre)", categorie: "petit_dejeuner", kcal: 70, proteines: 1.8, glucides: 14, lipides: 0.6, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 300, libelle: "1 bol" } },
  // Légumineuses et oléagineux
  { id: "niebe", nom: "Niébé cuit", categorie: "legumineuse", kcal: 116, proteines: 7.7, glucides: 21, lipides: 0.5, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "haricots-rouges", nom: "Haricots rouges cuits", categorie: "legumineuse", kcal: 127, proteines: 8.7, glucides: 22.8, lipides: 0.5, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "lentilles", nom: "Lentilles cuites", categorie: "legumineuse", kcal: 116, proteines: 9, glucides: 20, lipides: 0.4, allergenes: [], regimes: VEG, cout: "moyen", portion: { grammes: 150, libelle: "1 portion" } },
  { id: "arachides", nom: "Arachides grillées", categorie: "legumineuse", kcal: 585, proteines: 24, glucides: 21, lipides: 50, allergenes: ["arachide"], regimes: VEG, cout: "bas", portion: { grammes: 30, libelle: "1 poignée" } },
  { id: "pate-arachide", nom: "Pâte d’arachide", categorie: "legumineuse", kcal: 588, proteines: 25, glucides: 20, lipides: 50, allergenes: ["arachide"], regimes: VEG, cout: "bas", portion: { grammes: 20, libelle: "1 cuillère à soupe" } },
  // Protéines animales
  { id: "poulet", nom: "Poulet (blanc, sans peau) grillé", categorie: "proteine", kcal: 165, proteines: 31, glucides: 0, lipides: 3.6, allergenes: [], regimes: ANIMAL, cout: "moyen", portion: { grammes: 120, libelle: "1 morceau" } },
  { id: "thiof", nom: "Mérou (thiof) cuit", categorie: "proteine", kcal: 118, proteines: 25, glucides: 0, lipides: 1.3, allergenes: ["poisson"], regimes: ANIMAL, cout: "eleve", portion: { grammes: 150, libelle: "1 morceau" } },
  { id: "yaboy", nom: "Sardinelle (yaboy) grillée", categorie: "proteine", kcal: 208, proteines: 25, glucides: 0, lipides: 11.5, allergenes: ["poisson"], regimes: ANIMAL, cout: "bas", portion: { grammes: 120, libelle: "1 à 2 poissons" } },
  { id: "thon-naturel", nom: "Thon au naturel (conserve)", categorie: "proteine", kcal: 116, proteines: 26, glucides: 0, lipides: 1, allergenes: ["poisson"], regimes: ANIMAL, cout: "moyen", portion: { grammes: 100, libelle: "1 petite boîte" } },
  { id: "oeuf", nom: "Œuf dur", categorie: "proteine", kcal: 155, proteines: 13, glucides: 1.1, lipides: 11, allergenes: ["oeuf"], regimes: ["vegetarien", "sans_gluten", "sans_lactose"], cout: "bas", portion: { grammes: 100, libelle: "2 œufs" } },
  { id: "boeuf", nom: "Bœuf maigre cuit", categorie: "proteine", kcal: 200, proteines: 27, glucides: 0, lipides: 10, allergenes: [], regimes: ANIMAL, cout: "eleve", portion: { grammes: 120, libelle: "1 portion" } },
  { id: "mouton", nom: "Mouton cuit", categorie: "proteine", kcal: 250, proteines: 25, glucides: 0, lipides: 16, allergenes: [], regimes: ANIMAL, cout: "eleve", portion: { grammes: 120, libelle: "1 portion" } },
  { id: "crevettes", nom: "Crevettes cuites", categorie: "proteine", kcal: 99, proteines: 24, glucides: 0.2, lipides: 0.3, allergenes: ["crustaces"], regimes: ANIMAL, cout: "eleve", portion: { grammes: 120, libelle: "1 portion" } },
  // Produits laitiers
  { id: "lait-caille", nom: "Lait caillé (sow) nature", categorie: "laitier", kcal: 61, proteines: 3.5, glucides: 4.7, lipides: 3.3, allergenes: ["lait"], regimes: OVO_LACTO, cout: "bas", portion: { grammes: 250, libelle: "1 bol" } },
  { id: "lait", nom: "Lait entier", categorie: "laitier", kcal: 61, proteines: 3.2, glucides: 4.8, lipides: 3.3, allergenes: ["lait"], regimes: OVO_LACTO, cout: "bas", portion: { grammes: 250, libelle: "1 verre" } },
  // Légumes
  { id: "tomate", nom: "Tomate", categorie: "legume", kcal: 18, proteines: 0.9, glucides: 3.9, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 100, libelle: "1 tomate" } },
  { id: "oignon", nom: "Oignon", categorie: "legume", kcal: 40, proteines: 1.1, glucides: 9.3, lipides: 0.1, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 50, libelle: "1/2 oignon" } },
  { id: "chou", nom: "Chou cuit", categorie: "legume", kcal: 25, proteines: 1.3, glucides: 5.8, lipides: 0.1, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 100, libelle: "1 portion" } },
  { id: "carotte", nom: "Carotte", categorie: "legume", kcal: 41, proteines: 0.9, glucides: 9.6, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 100, libelle: "1 grosse" } },
  { id: "gombo", nom: "Gombo cuit", categorie: "legume", kcal: 33, proteines: 1.9, glucides: 7.5, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 100, libelle: "1 portion" } },
  { id: "aubergine", nom: "Aubergine (jaxatu) cuite", categorie: "legume", kcal: 24, proteines: 1, glucides: 5.9, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 100, libelle: "1 portion" } },
  { id: "salade", nom: "Salade verte", categorie: "legume", kcal: 15, proteines: 1.4, glucides: 2.9, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 60, libelle: "1 bol" } },
  // Fruits
  { id: "mangue", nom: "Mangue", categorie: "fruit", kcal: 60, proteines: 0.8, glucides: 15, lipides: 0.4, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 200, libelle: "1 petite" } },
  { id: "banane", nom: "Banane", categorie: "fruit", kcal: 89, proteines: 1.1, glucides: 23, lipides: 0.3, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 120, libelle: "1 banane" } },
  { id: "orange", nom: "Orange", categorie: "fruit", kcal: 47, proteines: 0.9, glucides: 12, lipides: 0.1, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 150, libelle: "1 orange" } },
  { id: "papaye", nom: "Papaye", categorie: "fruit", kcal: 43, proteines: 0.5, glucides: 11, lipides: 0.3, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 200, libelle: "1 tranche" } },
  { id: "pasteque", nom: "Pastèque", categorie: "fruit", kcal: 30, proteines: 0.6, glucides: 7.6, lipides: 0.2, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 300, libelle: "1 tranche" } },
  // Matières grasses
  { id: "huile-vegetale", nom: "Huile végétale", categorie: "matiere_grasse", kcal: 884, proteines: 0, glucides: 0, lipides: 100, allergenes: [], regimes: VEG, cout: "bas", portion: { grammes: 10, libelle: "1 cuillère à soupe" } },
];

const PAR_ID = new Map(ALIMENTS.map((a) => [a.id, a]));

export function trouverAliment(id: string): Aliment | undefined {
  return PAR_ID.get(id);
}

export type Apports = { kcal: number; proteines: number; glucides: number; lipides: number };

/** Apports d'une quantité (g) d'un aliment. */
export function apports(aliment: Aliment, grammes: number): Apports {
  const f = grammes / 100;
  return { kcal: aliment.kcal * f, proteines: aliment.proteines * f, glucides: aliment.glucides * f, lipides: aliment.lipides * f };
}

export function somme(liste: readonly Apports[]): Apports {
  return liste.reduce(
    (t, a) => ({ kcal: t.kcal + a.kcal, proteines: t.proteines + a.proteines, glucides: t.glucides + a.glucides, lipides: t.lipides + a.lipides }),
    { kcal: 0, proteines: 0, glucides: 0, lipides: 0 },
  );
}
