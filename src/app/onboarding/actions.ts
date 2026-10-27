"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { jourLocal } from "@/lib/dates";
import { exigerUtilisateur, getProfil } from "@/lib/data/session";
import { ETAPES, NOMBRE_ETAPES } from "@/lib/onboarding/etapes";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";
import type { Database } from "@/types/database";

type MiseAJourProfil = Database["public"]["Tables"]["profils"]["Update"];

/**
 * Valide une étape du questionnaire et enregistre ses réponses (profil + pesée du jour).
 * `complement` ajoute des champs à la même mise à jour (avancement de l'onboarding).
 */
async function appliquerEtape(
  index: number,
  valeurs: unknown,
  complement: (profil: Awaited<ReturnType<typeof getProfil>>) => MiseAJourProfil | string,
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
  const extra = complement(profil);
  if (typeof extra === "string") {
    return { ok: false, erreur: extra };
  }

  // Les champs facultatifs laissés vides sont enregistrés à null (réponse effacée).
  const { poids_kg: poids, ...champs } = resultat.data as Record<string, unknown>;
  const miseAJour: MiseAJourProfil = {
    ...Object.fromEntries(Object.entries(champs).map(([cle, valeur]) => [cle, valeur ?? null])),
    ...extra,
  };

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
  return { ok: true };
}

/** Valide et enregistre une étape du questionnaire, puis fait avancer l'utilisateur. */
export async function enregistrerEtape(index: number, valeurs: unknown): Promise<ResultatAction> {
  const derniere = index === NOMBRE_ETAPES - 1;
  const resultat = await appliquerEtape(index, valeurs, (profil) => {
    if (index > profil.onboarding_etape) {
      return "Complétez d’abord les étapes précédentes.";
    }
    return {
      onboarding_etape: Math.max(profil.onboarding_etape, index + 1),
      ...(derniere && !profil.onboarding_termine_le ? { onboarding_termine_le: new Date().toISOString() } : {}),
    };
  });
  if (resultat.ok && derniere) {
    redirect("/");
  }
  return resultat;
}

/** Modifie une section du profil depuis la page Profil (questionnaire déjà terminé). */
export async function modifierSectionProfil(index: number, valeurs: unknown): Promise<ResultatAction> {
  const resultat = await appliquerEtape(index, valeurs, (profil) =>
    profil.onboarding_termine_le ? {} : "Termine d’abord le questionnaire de démarrage.",
  );
  if (resultat.ok) {
    refresh();
    return { ok: true, message: "Modifications enregistrées." };
  }
  return resultat;
}
