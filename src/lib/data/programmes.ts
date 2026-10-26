import "server-only";

import type { Programme, ProgrammeExercice, ProgrammeSeance, StatutProgramme } from "@/types/database";

import { exigerUtilisateur } from "./session";

export type SeanceComplete = ProgrammeSeance & { exercices: ProgrammeExercice[] };
export type ProgrammeComplet = Programme & { seances: SeanceComplete[] };

/** Programme le plus récent d'un statut donné, avec ses séances et exercices triés. */
export async function getProgramme(statut: StatutProgramme): Promise<ProgrammeComplet | null> {
  const { supabase, userId } = await exigerUtilisateur();
  const { data: programme, error } = await supabase
    .from("programmes")
    .select("*")
    .eq("user_id", userId)
    .eq("statut", statut)
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Impossible de charger le programme.");
  if (!programme) return null;
  return { ...programme, seances: await getSeancesDuProgramme(programme.id) };
}

export async function getSeancesDuProgramme(programmeId: string): Promise<SeanceComplete[]> {
  const { supabase } = await exigerUtilisateur();
  const { data: seances, error } = await supabase
    .from("programme_seances")
    .select("*")
    .eq("programme_id", programmeId)
    .order("ordre");
  if (error) throw new Error("Impossible de charger les séances du programme.");
  const ids = (seances ?? []).map((s) => s.id);
  if (ids.length === 0) return [];
  const { data: exercices, error: erreurExercices } = await supabase
    .from("programme_exercices")
    .select("*")
    .in("seance_id", ids)
    .order("ordre");
  if (erreurExercices) throw new Error("Impossible de charger les exercices du programme.");
  return (seances ?? []).map((seance) => ({
    ...seance,
    exercices: (exercices ?? []).filter((e) => e.seance_id === seance.id),
  }));
}
