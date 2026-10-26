import "server-only";

import type { Pesee } from "@/types/database";

import { exigerUtilisateur } from "./session";

/** Pesées de l'utilisateur, de la plus ancienne à la plus récente (365 dernières au plus). */
export async function getPesees(): Promise<Pesee[]> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("pesees")
    .select("*")
    .eq("user_id", userId)
    .order("mesure_le", { ascending: false })
    .limit(365);
  if (error) {
    throw new Error("Impossible de charger vos pesées.");
  }
  return (data ?? []).reverse();
}
