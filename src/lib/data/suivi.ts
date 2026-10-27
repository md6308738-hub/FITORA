import "server-only";

import type { JournalSante, Mensuration, Objectif, Seance, SerieRealisee } from "@/types/database";

import { exigerUtilisateur } from "./session";

/** Lecture générique des lignes de l'utilisateur, avec gestion d'erreur explicite. */
async function lire<T>(requete: PromiseLike<{ data: T[] | null; error: unknown }>, quoi: string): Promise<T[]> {
  const { data, error } = await requete;
  if (error) throw new Error(`Impossible de charger ${quoi}.`);
  return data ?? [];
}

export async function getMensurations(): Promise<Mensuration[]> {
  const { supabase, userId } = await exigerUtilisateur();
  return lire(supabase.from("mensurations").select("*").eq("user_id", userId).order("mesure_le"), "les mensurations");
}

export async function getObjectifs(): Promise<Objectif[]> {
  const { supabase, userId } = await exigerUtilisateur();
  return lire(supabase.from("objectifs").select("*").eq("user_id", userId).order("cree_le", { ascending: false }), "les objectifs");
}

/** Séances terminées depuis une date, avec leurs séries. */
export async function getSeancesTerminees(depuis: string): Promise<{ seances: Seance[]; series: SerieRealisee[] }> {
  const { supabase, userId } = await exigerUtilisateur();
  const seances = await lire(
    supabase.from("seances").select("*").eq("user_id", userId).eq("statut", "terminee").gte("commencee_le", depuis).order("commencee_le"),
    "les séances",
  );
  const ids = seances.map((s) => s.id);
  const series = ids.length
    ? await lire(supabase.from("series_realisees").select("*").in("seance_id", ids), "les séries")
    : [];
  return { seances, series };
}

export async function getJournalSante(depuis: string): Promise<JournalSante[]> {
  const { supabase, userId } = await exigerUtilisateur();
  return lire(supabase.from("journal_sante").select("*").eq("user_id", userId).gte("jour", depuis).order("jour"), "le journal de santé");
}
