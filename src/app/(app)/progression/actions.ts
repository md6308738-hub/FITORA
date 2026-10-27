"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { jourLocal } from "@/lib/dates";
import { exigerUtilisateur } from "@/lib/data/session";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";

const nombre = (min: number, max: number, message: string) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(String(v).replace(",", "."))), z.number({ error: message }).gt(min, message).lte(max, message));

const LIMITES: Record<string, [number, number]> = {
  tour_de_taille: [30, 250],
  hanches: [30, 250],
  poitrine: [30, 250],
  bras: [10, 80],
  cuisse: [20, 120],
  masse_grasse: [2, 70],
};

const mensurationSchema = z
  .object({
    type: z.enum(["tour_de_taille", "hanches", "poitrine", "bras", "cuisse", "masse_grasse"], { error: "Choisis une mesure." }),
    valeur: nombre(0, 400, "Indique une valeur valide."),
  })
  .superRefine((v, ctx) => {
    const [min, max] = LIMITES[v.type] ?? [0, 400];
    if (v.valeur < min || v.valeur > max) {
      ctx.addIssue({ code: "custom", path: ["valeur"], message: `Valeur attendue entre ${min} et ${max}.` });
    }
  });

export async function enregistrerMensuration(valeurs: unknown): Promise<ResultatAction> {
  const resultat = mensurationSchema.safeParse(valeurs);
  if (!resultat.success) return { ok: false, erreur: "Mesure invalide.", champs: erreursParChamp(resultat.error) };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase
    .from("mensurations")
    .upsert({ user_id: userId, mesure_le: jourLocal(), ...resultat.data }, { onConflict: "user_id,mesure_le,type" });
  if (error) return { ok: false, erreur: "La mesure n’a pas pu être enregistrée." };
  refresh();
  return { ok: true, message: "Mesure enregistrée." };
}

const objectifSchema = z
  .object({
    type: z.enum(["poids", "seances_semaine", "hydratation", "pas"], { error: "Choisis un type d’objectif." }),
    cible: nombre(0, 100000, "Indique une cible valide."),
    echeance: z.preprocess((v) => (v === "" ? undefined : v), z.iso.date({ error: "Date invalide." }).optional()),
  })
  .superRefine((v, ctx) => {
    const bornes: Record<string, [number, number]> = { poids: [30, 300], seances_semaine: [1, 14], hydratation: [500, 6000], pas: [500, 50000] };
    const [min, max] = bornes[v.type] ?? [0, 100000];
    if (v.cible < min || v.cible > max) ctx.addIssue({ code: "custom", path: ["cible"], message: `Cible attendue entre ${min} et ${max}.` });
    if (v.echeance && v.echeance < jourLocal()) ctx.addIssue({ code: "custom", path: ["echeance"], message: "L’échéance doit être future." });
  });

export async function creerObjectif(valeurs: unknown): Promise<ResultatAction> {
  const resultat = objectifSchema.safeParse(valeurs);
  if (!resultat.success) return { ok: false, erreur: "Objectif invalide.", champs: erreursParChamp(resultat.error) };
  const { supabase } = await exigerUtilisateur();
  const { error } = await supabase.from("objectifs").insert({
    type: resultat.data.type,
    cible: resultat.data.cible,
    debut_le: jourLocal(),
    echeance_le: resultat.data.echeance ?? null,
  });
  if (error) return { ok: false, erreur: "L’objectif n’a pas pu être créé." };
  refresh();
  return { ok: true, message: "Objectif ajouté." };
}

const changement = z.object({ id: z.uuid(), statut: z.enum(["atteint", "abandonne", "en_cours"]) });

export async function changerStatutObjectif(id: string, statut: string): Promise<ResultatAction> {
  const resultat = changement.safeParse({ id, statut });
  if (!resultat.success) return { ok: false, erreur: "Action invalide." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("objectifs").update({ statut: resultat.data.statut }).eq("id", resultat.data.id).eq("user_id", userId);
  if (error) return { ok: false, erreur: "La modification a échoué." };
  refresh();
  return { ok: true };
}

export async function supprimerObjectif(id: string): Promise<ResultatAction> {
  if (!z.uuid().safeParse(id).success) return { ok: false, erreur: "Objectif inconnu." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("objectifs").delete().eq("id", id).eq("user_id", userId);
  if (error) return { ok: false, erreur: "La suppression a échoué." };
  refresh();
  return { ok: true };
}
