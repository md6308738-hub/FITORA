"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { alternatives, trouverExercice } from "@/lib/exercices/catalogue";
import { exigerProfilComplet, exigerUtilisateur } from "@/lib/data/session";
import { genererProgramme } from "@/lib/programmes/generateur";
import type { ResultatAction } from "@/lib/validation/auth";

const uuid = z.uuid();

/** Génère une proposition à partir du profil ; remplace la proposition précédente non validée. */
export async function proposerProgramme(nouvelleVersion: boolean): Promise<ResultatAction> {
  const profil = await exigerProfilComplet();
  const { supabase, userId } = await exigerUtilisateur();
  if (!profil.objectif || !profil.niveau || !profil.jours_par_semaine || !profil.duree_seance_min || !profil.materiel) {
    return { ok: false, erreur: "Complète ton profil (objectif, niveau, disponibilités, matériel) pour générer un programme." };
  }

  const { data: precedente } = await supabase
    .from("programmes")
    .select("variante")
    .eq("user_id", userId)
    .eq("statut", "propose")
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  const variante = nouvelleVersion && precedente ? precedente.variante + 1 : 0;

  const proposition = genererProgramme({
    objectif: profil.objectif,
    niveau: profil.niveau,
    joursParSemaine: profil.jours_par_semaine,
    dureeSeanceMin: profil.duree_seance_min,
    materiel: profil.materiel,
    blessures: profil.blessures,
    variante,
  });

  await supabase.from("programmes").delete().eq("user_id", userId).eq("statut", "propose");

  const { data: programme, error } = await supabase
    .from("programmes")
    .insert({
      titre: proposition.titre,
      objectif: profil.objectif,
      niveau: profil.niveau,
      jours_par_semaine: profil.jours_par_semaine,
      duree_seance_min: profil.duree_seance_min,
      variante,
    })
    .select("id")
    .single();
  if (error || !programme) return { ok: false, erreur: "La proposition n’a pas pu être enregistrée. Réessaie." };

  try {
    for (const [index, seance] of proposition.seances.entries()) {
      const { data: ligne, error: erreurSeance } = await supabase
        .from("programme_seances")
        .insert({ programme_id: programme.id, ordre: index + 1, nom: seance.nom, jour_semaine: seance.jourSemaine })
        .select("id")
        .single();
      if (erreurSeance || !ligne) throw erreurSeance;
      const { error: erreurExercices } = await supabase.from("programme_exercices").insert(
        seance.exercices.map((e, ordre) => ({
          seance_id: ligne.id,
          ordre: ordre + 1,
          exercice_id: e.exerciceId,
          series: e.series,
          reps_min: e.repsMin,
          reps_max: e.repsMax,
          duree_sec: e.dureeSec,
          repos_sec: e.reposSec,
        })),
      );
      if (erreurExercices) throw erreurExercices;
    }
  } catch {
    // Pas de programme à moitié enregistré : la suppression part en cascade.
    await supabase.from("programmes").delete().eq("id", programme.id);
    return { ok: false, erreur: "La proposition n’a pas pu être enregistrée. Réessaie." };
  }

  refresh();
  return { ok: true };
}

/** Valide une proposition : elle devient le programme actif, l'ancien est archivé. */
export async function validerProgramme(programmeId: string): Promise<ResultatAction> {
  if (!uuid.safeParse(programmeId).success) return { ok: false, erreur: "Programme inconnu." };
  const { supabase, userId } = await exigerUtilisateur();

  const { data: cible } = await supabase
    .from("programmes")
    .select("id, statut")
    .eq("id", programmeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!cible || cible.statut !== "propose") return { ok: false, erreur: "Cette proposition n’est plus disponible." };

  const { error: erreurArchive } = await supabase
    .from("programmes")
    .update({ statut: "archive" })
    .eq("user_id", userId)
    .eq("statut", "actif");
  if (erreurArchive) return { ok: false, erreur: "La validation a échoué. Réessaie." };

  const { error } = await supabase
    .from("programmes")
    .update({ statut: "actif", active_le: new Date().toISOString() })
    .eq("id", programmeId);
  if (error) return { ok: false, erreur: "La validation a échoué. Réessaie." };

  refresh();
  return { ok: true, message: "Programme activé." };
}

const changementJour = z.object({ seanceId: uuid, jour: z.coerce.number().int().min(1).max(7) });

/** Déplace une séance type sur un autre jour de la semaine. */
export async function changerJourSeance(seanceId: string, jour: number): Promise<ResultatAction> {
  const resultat = changementJour.safeParse({ seanceId, jour });
  if (!resultat.success) return { ok: false, erreur: "Jour invalide." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error, count } = await supabase
    .from("programme_seances")
    .update({ jour_semaine: resultat.data.jour }, { count: "exact" })
    .eq("id", resultat.data.seanceId)
    .eq("user_id", userId);
  if (error || count === 0) return { ok: false, erreur: "Le changement de jour a échoué." };
  refresh();
  return { ok: true };
}

/** Remplace un exercice par une alternative du même schéma de mouvement. */
export async function remplacerExercice(programmeExerciceId: string, nouvelExerciceId: string): Promise<ResultatAction> {
  if (!uuid.safeParse(programmeExerciceId).success) return { ok: false, erreur: "Exercice inconnu." };
  const { supabase, userId } = await exigerUtilisateur();
  const { data: ligne } = await supabase
    .from("programme_exercices")
    .select("exercice_id")
    .eq("id", programmeExerciceId)
    .eq("user_id", userId)
    .maybeSingle();
  const actuel = ligne ? trouverExercice(ligne.exercice_id) : undefined;
  const nouveau = trouverExercice(nouvelExerciceId);
  if (!actuel || !nouveau || !alternatives(actuel).some((a) => a.id === nouveau.id)) {
    return { ok: false, erreur: "Ce remplacement n’est pas compatible avec l’exercice prévu." };
  }
  // La mesure peut changer (répétitions ↔ durée) : on garde la prescription si elle reste compatible.
  if (actuel.mesure !== nouveau.mesure) {
    return { ok: false, erreur: "Choisis une alternative mesurée de la même façon (répétitions ou durée)." };
  }
  const { error } = await supabase
    .from("programme_exercices")
    .update({ exercice_id: nouveau.id })
    .eq("id", programmeExerciceId)
    .eq("user_id", userId);
  if (error) return { ok: false, erreur: "Le remplacement a échoué." };
  refresh();
  return { ok: true };
}
