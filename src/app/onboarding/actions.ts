"use server";

import { redirect } from "next/navigation";

import { jourLocal } from "@/lib/dates";
import { exigerUtilisateur, getProfil } from "@/lib/data/session";
import { ETAPES, NOMBRE_ETAPES } from "@/lib/onboarding/etapes";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";
import type { Database } from "@/types/database";

type MiseAJourProfil = Database["public"]["Tables"]["profils"]["Update"];

/** Valide et enregistre une étape du questionnaire, puis fait avancer l'utilisateur. */
export async function enregistrerEtape(
  index: number,
  valeurs: unknown,
): Promise<ResultatAction> {
  const etape = Number.isInteger(index) ? ETAPES[index] : undefined;
  if (!etape) {
    return { ok: false, erreur: "Étape inconnue." };
  }

  const resultat = etape.schema.safeParse(valeurs);
  if (!resultat.success) {
    return {
      ok: false,
      erreur: "Certaines réponses sont invalides.",
      champs: erreursParChamp(resultat.error),
    };
  }

  const { supabase, userId } = await exigerUtilisateur();
  const profil = await getProfil();
  if (index > profil.onboarding_etape) {
    return { ok: false, erreur: "Complétez d’abord les étapes précédentes." };
  }

  // Les champs facultatifs laissés vides sont enregistrés à null (réponse effacée).
  const { poids_kg: poids, ...champs } = resultat.data as Record<string, unknown>;
  const miseAJour: MiseAJourProfil = Object.fromEntries(
    Object.entries(champs).map(([cle, valeur]) => [cle, valeur ?? null]),
  );
  miseAJour.onboarding_etape = Math.max(profil.onboarding_etape, index + 1);
  const derniere = index === NOMBRE_ETAPES - 1;
  if (derniere && !profil.onboarding_termine_le) {
    miseAJour.onboarding_termine_le = new Date().toISOString();
  }

  if (typeof poids === "number") {
    const { error } = await supabase
      .from("pesees")
      .upsert(
        { user_id: userId, mesure_le: jourLocal(), poids_kg: poids },
        { onConflict: "user_id,mesure_le" },
      );
    if (error) {
      return { ok: false, erreur: "Votre poids n’a pas pu être enregistré. Réessayez." };
    }
  }

  const { error } = await supabase.from("profils").update(miseAJour).eq("id", userId);
  if (error) {
    return { ok: false, erreur: "Vos réponses n’ont pas pu être enregistrées. Réessayez." };
  }

  if (derniere) {
    redirect("/");
  }
  return { ok: true };
}
