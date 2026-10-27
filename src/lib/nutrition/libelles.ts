import type { MomentRepas } from "@/types/database";

import type { Categorie } from "./aliments";

/** Libellés partagés entre composants serveur et client (un module "use client" ne peut pas exporter de données vers le serveur). */
export const MOMENTS: { valeur: MomentRepas; libelle: string }[] = [
  { valeur: "petit_dejeuner", libelle: "Petit-déjeuner" },
  { valeur: "dejeuner", libelle: "Déjeuner" },
  { valeur: "diner", libelle: "Dîner" },
  { valeur: "collation", libelle: "Collation" },
];

export const CATEGORIES: Record<Categorie, string> = {
  feculent: "Féculents",
  petit_dejeuner: "Petit-déjeuner",
  legumineuse: "Légumineuses et arachide",
  proteine: "Viandes, poissons, œufs",
  laitier: "Produits laitiers",
  legume: "Légumes",
  fruit: "Fruits",
  matiere_grasse: "Matières grasses",
};
