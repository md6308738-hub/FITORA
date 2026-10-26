import "server-only";

import type { PriseEau } from "@/types/database";

import { exigerUtilisateur } from "./session";

/** Prises d'eau de l'utilisateur à partir d'un jour donné (AAAA-MM-JJ). */
export async function getPrisesEauDepuis(jour: string): Promise<PriseEau[]> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("prises_eau")
    .select("*")
    .eq("user_id", userId)
    .gte("jour", jour)
    .order("cree_le", { ascending: true });
  if (error) {
    throw new Error("Impossible de charger votre hydratation.");
  }
  return data ?? [];
}
