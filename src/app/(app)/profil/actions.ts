"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { exigerUtilisateur } from "@/lib/data/session";
import { createAdminClient, createClientVerification } from "@/lib/supabase/admin";
import {
  erreursParChamp,
  identiteSchema,
  suppressionCompteSchema,
  type ResultatAction,
} from "@/lib/validation/auth";

/** Version du texte d'information sur les données de santé acceptée par l'utilisateur. */
const VERSION_CONSENTEMENT = 1;

export async function modifierIdentite(valeurs: unknown): Promise<ResultatAction> {
  const resultat = identiteSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { ok: false, erreur: "Certains champs sont invalides.", champs: erreursParChamp(resultat.error) };
  }
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("profils").update(resultat.data).eq("id", userId);
  if (error) return { ok: false, erreur: "La modification a échoué. Réessaie." };
  refresh();
  return { ok: true, message: "Informations mises à jour." };
}

export async function donnerConsentementSante(): Promise<ResultatAction> {
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase
    .from("profils")
    .update({ consentement_sante_le: new Date().toISOString(), consentement_sante_version: VERSION_CONSENTEMENT })
    .eq("id", userId);
  if (error) return { ok: false, erreur: "Le consentement n’a pas pu être enregistré." };
  refresh();
  return { ok: true };
}

/** Retrait du consentement : le journal de santé et les informations de santé du profil sont effacés. */
export async function retirerConsentementSante(): Promise<ResultatAction> {
  const { supabase, userId } = await exigerUtilisateur();
  const { error: erreurJournal } = await supabase.from("journal_sante").delete().eq("user_id", userId);
  const { error } = await supabase
    .from("profils")
    .update({ consentement_sante_le: null, consentement_sante_version: null, blessures: null, sommeil_heures: null })
    .eq("id", userId);
  if (error || erreurJournal) return { ok: false, erreur: "Le retrait n’a pas pu être enregistré. Réessaie." };
  refresh();
  return { ok: true };
}

/**
 * Suppression définitive du compte (cahier des charges § 6.1), après nouvelle saisie du mot de passe.
 * Toutes les données sont effacées en cascade.
 */
export async function supprimerCompte(valeurs: unknown): Promise<ResultatAction> {
  const resultat = suppressionCompteSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { ok: false, erreur: "Confirmation incomplète.", champs: erreursParChamp(resultat.error) };
  }
  const { supabase, userId } = await exigerUtilisateur();
  const { data: utilisateur } = await supabase.auth.getUser();
  const email = utilisateur.user?.email;
  if (!email || utilisateur.user?.id !== userId) return { ok: false, erreur: "Session invalide : reconnecte-toi." };

  const verification = await createClientVerification().auth.signInWithPassword({ email, password: resultat.data.motDePasse });
  if (verification.error) {
    return { ok: false, erreur: "Mot de passe incorrect.", champs: { motDePasse: "Mot de passe incorrect." } };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, erreur: "La suppression de compte n’est pas disponible pour le moment. Contacte le support." };
  }
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, erreur: "La suppression a échoué. Réessaie plus tard." };

  await supabase.auth.signOut();
  redirect("/");
}
