"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { estimerBesoins } from "@/lib/calculs/nutrition";
import { jourLocal } from "@/lib/dates";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet, exigerUtilisateur } from "@/lib/data/session";
import { trouverAliment } from "@/lib/nutrition/aliments";
import { genererPlan, planSchema } from "@/lib/nutrition/plan";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";

const repasSchema = z.object({
  moment: z.enum(["petit_dejeuner", "dejeuner", "diner", "collation"], { error: "Choisis le repas." }),
  alimentId: z.string().refine((id) => Boolean(trouverAliment(id)), "Choisis un aliment."),
  quantiteG: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(String(v).replace(",", "."))),
    z.number({ error: "Indique une quantité." }).gt(0, "Quantité invalide.").lte(3000, "Quantité invalide."),
  ),
});

export async function ajouterRepas(valeurs: unknown): Promise<ResultatAction> {
  const resultat = repasSchema.safeParse(valeurs);
  if (!resultat.success) return { ok: false, erreur: "Saisie invalide.", champs: erreursParChamp(resultat.error) };
  const { supabase } = await exigerUtilisateur();
  const { error } = await supabase.from("repas_entrees").insert({
    consomme_le: jourLocal(),
    moment: resultat.data.moment,
    aliment_id: resultat.data.alimentId,
    quantite_g: resultat.data.quantiteG,
  });
  if (error) return { ok: false, erreur: "Le repas n’a pas pu être enregistré." };
  refresh();
  return { ok: true, message: "Ajouté au journal." };
}

export async function supprimerRepas(id: number): Promise<ResultatAction> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, erreur: "Entrée inconnue." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("repas_entrees").delete().eq("id", id).eq("user_id", userId);
  if (error) return { ok: false, erreur: "La suppression a échoué." };
  refresh();
  return { ok: true };
}

/** Génère et enregistre un plan de 7 jours à partir des besoins estimés et des préférences du profil. */
export async function genererPlanRepas(nouvelleVersion: boolean): Promise<ResultatAction> {
  const profil = await exigerProfilComplet();
  const { supabase, userId } = await exigerUtilisateur();
  const poids = (await getPesees()).at(-1)?.poids_kg;
  if (!poids || !profil.taille_cm || !profil.age || !profil.niveau_activite || !profil.objectif) {
    return { ok: false, erreur: "Il manque des informations (poids, taille, âge, activité, objectif) pour estimer tes besoins." };
  }
  const besoins = estimerBesoins({
    poidsKg: poids,
    tailleCm: profil.taille_cm,
    age: profil.age,
    sexe: profil.sexe,
    niveauActivite: profil.niveau_activite,
    objectif: profil.objectif,
  });

  const { data: precedent } = await supabase
    .from("plans_repas")
    .select("variante")
    .eq("user_id", userId)
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  const variante = nouvelleVersion && precedent ? precedent.variante + 1 : 0;

  const plan = planSchema.parse(
    genererPlan({
      kcalCible: besoins.apportCibleKcal,
      proteinesCibleG: besoins.proteinesG,
      restrictions: profil.restrictions_alimentaires,
      allergies: profil.allergies,
      budget: profil.budget_alimentaire,
      alimentsPreferes: profil.aliments_preferes,
      variante,
    }),
  );

  const { error } = await supabase.from("plans_repas").insert({ kcal_cible: besoins.apportCibleKcal, variante, contenu: plan });
  if (error) return { ok: false, erreur: "Le plan n’a pas pu être enregistré." };
  refresh();
  return { ok: true };
}
