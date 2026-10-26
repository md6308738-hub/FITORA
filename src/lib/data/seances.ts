import "server-only";

import type { Seance, SerieRealisee } from "@/types/database";

import { exigerUtilisateur } from "./session";

export async function getSeanceEnCours(): Promise<Seance | null> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("seances")
    .select("*")
    .eq("user_id", userId)
    .eq("statut", "en_cours")
    .maybeSingle();
  if (error) throw new Error("Impossible de charger la séance en cours.");
  return data;
}

export async function getSeriesDeSeance(seanceId: string): Promise<SerieRealisee[]> {
  const { supabase } = await exigerUtilisateur();
  const { data, error } = await supabase
    .from("series_realisees")
    .select("*")
    .eq("seance_id", seanceId)
    .order("numero");
  if (error) throw new Error("Impossible de charger les séries.");
  return data ?? [];
}

/** Séries de la dernière séance terminée où chaque exercice a été pratiqué. */
export async function getDernieresPerformances(
  exerciceIds: readonly string[],
): Promise<Record<string, SerieRealisee[]>> {
  if (exerciceIds.length === 0) return {};
  const { supabase, userId } = await exigerUtilisateur();
  const { data: terminees } = await supabase
    .from("seances")
    .select("id")
    .eq("user_id", userId)
    .eq("statut", "terminee")
    .order("commencee_le", { ascending: false })
    .limit(60);
  const ids = (terminees ?? []).map((s) => s.id);
  if (ids.length === 0) return {};
  const { data: series, error } = await supabase
    .from("series_realisees")
    .select("*")
    .in("seance_id", ids)
    .in("exercice_id", [...exerciceIds]);
  if (error) throw new Error("Impossible de charger l’historique des performances.");

  const ordre = new Map(ids.map((id, index) => [id, index]));
  const resultat: Record<string, SerieRealisee[]> = {};
  for (const exerciceId of exerciceIds) {
    const siennes = (series ?? []).filter((s) => s.exercice_id === exerciceId);
    if (siennes.length === 0) continue;
    const plusRecente = siennes.reduce((a, b) => ((ordre.get(a.seance_id) ?? 99) <= (ordre.get(b.seance_id) ?? 99) ? a : b)).seance_id;
    resultat[exerciceId] = siennes.filter((s) => s.seance_id === plusRecente).sort((a, b) => a.numero - b.numero);
  }
  return resultat;
}

export type SeanceHistorique = Seance & { nombreSeries: number };

export async function getHistorique(limite = 15): Promise<SeanceHistorique[]> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data: seances, error } = await supabase
    .from("seances")
    .select("*")
    .eq("user_id", userId)
    .eq("statut", "terminee")
    .order("commencee_le", { ascending: false })
    .limit(limite);
  if (error) throw new Error("Impossible de charger l’historique.");
  const ids = (seances ?? []).map((s) => s.id);
  if (ids.length === 0) return [];
  const { data: series } = await supabase.from("series_realisees").select("seance_id").in("seance_id", ids);
  return (seances ?? []).map((s) => ({
    ...s,
    nombreSeries: (series ?? []).filter((serie) => serie.seance_id === s.id).length,
  }));
}
