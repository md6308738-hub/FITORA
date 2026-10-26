"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { trouverExercice } from "@/lib/exercices/catalogue";
import { exigerUtilisateur } from "@/lib/data/session";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";

const uuid = z.uuid();

/**
 * Démarre une séance. L'identifiant est généré par le client : un double clic ou une
 * nouvelle tentative réseau ne crée jamais de doublon (cahier des charges § 10.4).
 */
export async function demarrerSeance(seanceId: string, programmeSeanceId: string): Promise<ResultatAction> {
  if (!uuid.safeParse(seanceId).success || !uuid.safeParse(programmeSeanceId).success) {
    return { ok: false, erreur: "Séance inconnue." };
  }
  const { supabase, userId } = await exigerUtilisateur();

  const { data: enCours } = await supabase
    .from("seances")
    .select("id")
    .eq("user_id", userId)
    .eq("statut", "en_cours")
    .maybeSingle();
  if (enCours) {
    refresh();
    return enCours.id === seanceId ? { ok: true } : { ok: false, erreur: "Une séance est déjà en cours : termine-la ou annule-la d’abord." };
  }

  const { data: type } = await supabase
    .from("programme_seances")
    .select("id, nom")
    .eq("id", programmeSeanceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!type) return { ok: false, erreur: "Cette séance ne fait pas partie de ton programme." };

  const { error } = await supabase
    .from("seances")
    .upsert({ id: seanceId, programme_seance_id: type.id, nom: type.nom }, { onConflict: "id", ignoreDuplicates: true });
  if (error) return { ok: false, erreur: "La séance n’a pas pu démarrer. Réessaie." };

  refresh();
  return { ok: true };
}

const serieSchema = z.object({
  seanceId: uuid,
  exerciceId: z.string().refine((id) => Boolean(trouverExercice(id)), "Exercice inconnu."),
  numero: z.number().int().min(1).max(20),
  chargeKg: z.number().min(0, "Charge invalide.").max(500, "Charge invalide.").nullable(),
  repetitions: z.number().int().min(0, "Répétitions invalides.").max(100, "Répétitions invalides.").nullable(),
  dureeSec: z.number().int().min(0).max(3600).nullable(),
});

export type SerieSaisie = z.infer<typeof serieSchema>;

/** Enregistre (ou corrige) une série d'une séance en cours. */
export async function enregistrerSerie(saisie: SerieSaisie): Promise<ResultatAction> {
  const resultat = serieSchema.safeParse(saisie);
  if (!resultat.success) {
    return { ok: false, erreur: "Série invalide.", champs: erreursParChamp(resultat.error) };
  }
  const { seanceId, exerciceId, numero, chargeKg, repetitions, dureeSec } = resultat.data;
  if (repetitions === null && dureeSec === null) {
    return { ok: false, erreur: "Indique le nombre de répétitions ou la durée." };
  }
  const { supabase, userId } = await exigerUtilisateur();

  const { data: seance } = await supabase
    .from("seances")
    .select("statut")
    .eq("id", seanceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!seance || seance.statut !== "en_cours") {
    return { ok: false, erreur: "Cette séance n’est plus en cours." };
  }

  const { error } = await supabase.from("series_realisees").upsert(
    { seance_id: seanceId, exercice_id: exerciceId, numero, charge_kg: chargeKg, repetitions, duree_sec: dureeSec },
    { onConflict: "seance_id,exercice_id,numero" },
  );
  if (error) return { ok: false, erreur: "La série n’a pas pu être enregistrée. Réessaie." };
  return { ok: true };
}

const fin = z.object({ seanceId: uuid, notes: z.string().trim().max(1000, "1000 caractères maximum.").optional() });

export async function terminerSeance(seanceId: string, notes?: string): Promise<ResultatAction> {
  const resultat = fin.safeParse({ seanceId, notes });
  if (!resultat.success) return { ok: false, erreur: "Notes invalides (1000 caractères maximum)." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error, count } = await supabase
    .from("seances")
    .update(
      { statut: "terminee", terminee_le: new Date().toISOString(), notes: resultat.data.notes || null },
      { count: "exact" },
    )
    .eq("id", resultat.data.seanceId)
    .eq("user_id", userId)
    .eq("statut", "en_cours");
  if (error || count === 0) return { ok: false, erreur: "La séance n’a pas pu être terminée." };
  refresh();
  return { ok: true, message: "Séance enregistrée." };
}

export async function annulerSeance(seanceId: string): Promise<ResultatAction> {
  if (!uuid.safeParse(seanceId).success) return { ok: false, erreur: "Séance inconnue." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase
    .from("seances")
    .update({ statut: "annulee", terminee_le: new Date().toISOString() })
    .eq("id", seanceId)
    .eq("user_id", userId)
    .eq("statut", "en_cours");
  if (error) return { ok: false, erreur: "L’annulation a échoué." };
  refresh();
  return { ok: true };
}
