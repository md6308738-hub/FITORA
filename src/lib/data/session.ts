import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Profil } from "@/types/database";

/**
 * Utilisateur connecté (identité vérifiée via le jeton signé) et client Supabase.
 * Redirige vers la connexion sans session valide.
 */
export const exigerUtilisateur = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) {
    redirect("/connexion");
  }
  return { supabase, userId };
});

/** Profil de l'utilisateur connecté (lecture filtrée aussi par la RLS). */
export const getProfil = cache(async (): Promise<Profil> => {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("profils")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) {
    throw new Error("Impossible de charger votre profil.");
  }
  return data;
});

/** Profil d'un utilisateur ayant terminé le questionnaire ; sinon redirection vers celui-ci. */
export async function exigerProfilComplet(): Promise<Profil> {
  const profil = await getProfil();
  if (!profil.onboarding_termine_le) {
    redirect("/onboarding");
  }
  return profil;
}
