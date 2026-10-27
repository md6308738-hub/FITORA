import "server-only";

import { planSchema, type Plan } from "@/lib/nutrition/plan";
import type { RepasEntree } from "@/types/database";

import { exigerUtilisateur } from "./session";

export async function getRepasDuJour(jour: string): Promise<RepasEntree[]> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("repas_entrees")
    .select("*")
    .eq("user_id", userId)
    .eq("consomme_le", jour)
    .order("cree_le");
  if (error) throw new Error("Impossible de charger le journal des repas.");
  return data ?? [];
}

/** Dernier plan de repas, validé à la lecture (un contenu altéré n'est pas affiché). */
export async function getDernierPlan(): Promise<{ plan: Plan; kcalCible: number; creeLe: string } | null> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("plans_repas")
    .select("*")
    .eq("user_id", userId)
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Impossible de charger le plan de repas.");
  if (!data) return null;
  const plan = planSchema.safeParse(data.contenu);
  return plan.success ? { plan: plan.data, kcalCible: data.kcal_cible, creeLe: data.cree_le } : null;
}
