"use server";

import { refresh } from "next/cache";

import { jourLocal } from "@/lib/dates";
import { exigerUtilisateur } from "@/lib/data/session";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";
import { peseeSchema, priseEauSchema } from "@/lib/validation/suivi";

/** Enregistre (ou corrige) la pesée du jour. */
export async function enregistrerPesee(valeurs: unknown): Promise<ResultatAction> {
  const resultat = peseeSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { ok: false, erreur: "Poids invalide.", champs: erreursParChamp(resultat.error) };
  }

  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase
    .from("pesees")
    .upsert(
      { user_id: userId, mesure_le: jourLocal(), poids_kg: resultat.data.poids_kg },
      { onConflict: "user_id,mesure_le" },
    );
  if (error) {
    return { ok: false, erreur: "La pesée n’a pas pu être enregistrée. Réessayez." };
  }

  refresh();
  return { ok: true, message: "Pesée enregistrée." };
}

export async function ajouterEau(quantiteMl: number): Promise<ResultatAction> {
  const resultat = priseEauSchema.safeParse({ quantite_ml: quantiteMl });
  if (!resultat.success) {
    return { ok: false, erreur: "Quantité invalide." };
  }

  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase
    .from("prises_eau")
    .insert({ user_id: userId, jour: jourLocal(), quantite_ml: resultat.data.quantite_ml });
  if (error) {
    return { ok: false, erreur: "L’ajout n’a pas pu être enregistré. Réessayez." };
  }

  refresh();
  return { ok: true };
}

/** Annule la dernière prise d'eau du jour (erreur de saisie). */
export async function annulerDerniereEau(): Promise<ResultatAction> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data: derniere, error: erreurLecture } = await supabase
    .from("prises_eau")
    .select("id")
    .eq("user_id", userId)
    .eq("jour", jourLocal())
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erreurLecture) {
    return { ok: false, erreur: "L’annulation a échoué. Réessayez." };
  }
  if (!derniere) {
    return { ok: false, erreur: "Rien à annuler aujourd’hui." };
  }

  const { error } = await supabase.from("prises_eau").delete().eq("id", derniere.id);
  if (error) {
    return { ok: false, erreur: "L’annulation a échoué. Réessayez." };
  }

  refresh();
  return { ok: true };
}
