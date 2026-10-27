"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { jourLocal } from "@/lib/dates";
import { exigerUtilisateur, getProfil } from "@/lib/data/session";
import { erreursParChamp, type ResultatAction } from "@/lib/validation/auth";

const entier = (min: number, max: number, message: string) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(String(v).replace(",", "."))), z.number({ error: message }).int(message).min(min, message).max(max, message).optional());

const journalSchema = z.object({
  sommeilHeures: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(String(v).replace(",", "."))),
    z.number({ error: "Durée de sommeil invalide." }).min(0, "Durée de sommeil invalide.").max(24, "Durée de sommeil invalide.").optional(),
  ),
  qualiteSommeil: entier(1, 5, "Qualité entre 1 et 5."),
  fatigue: entier(1, 5, "Fatigue entre 1 et 5."),
  pas: entier(0, 100000, "Nombre de pas invalide."),
  douleurZone: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(60, "60 caractères maximum.").optional()),
  douleurIntensite: entier(0, 10, "Intensité entre 0 et 10."),
  note: z.preprocess((v) => (v === "" ? undefined : v), z.string().trim().max(500, "500 caractères maximum.").optional()),
});

/** Enregistre (ou complète) l'entrée du jour du journal de santé. */
export async function enregistrerJournal(valeurs: unknown): Promise<ResultatAction> {
  const resultat = journalSchema.safeParse(valeurs);
  if (!resultat.success) return { ok: false, erreur: "Certaines valeurs sont invalides.", champs: erreursParChamp(resultat.error) };
  const profil = await getProfil();
  if (!profil.consentement_sante_le) return { ok: false, erreur: "Donne d’abord ton consentement au suivi des données de santé." };
  const d = resultat.data;
  if (Object.values(d).every((v) => v === undefined)) return { ok: false, erreur: "Renseigne au moins une information." };

  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("journal_sante").upsert(
    {
      user_id: userId,
      jour: jourLocal(),
      sommeil_min: d.sommeilHeures === undefined ? null : Math.round(d.sommeilHeures * 60),
      qualite_sommeil: d.qualiteSommeil ?? null,
      fatigue: d.fatigue ?? null,
      pas: d.pas ?? null,
      douleur_zone: d.douleurZone ?? null,
      douleur_intensite: d.douleurIntensite ?? null,
      note: d.note ?? null,
      modifie_le: new Date().toISOString(),
    },
    { onConflict: "user_id,jour" },
  );
  if (error) return { ok: false, erreur: "L’entrée n’a pas pu être enregistrée." };
  refresh();
  return { ok: true, message: "Journal du jour enregistré." };
}

export async function supprimerJournal(jour: string): Promise<ResultatAction> {
  if (!z.iso.date().safeParse(jour).success) return { ok: false, erreur: "Date invalide." };
  const { supabase, userId } = await exigerUtilisateur();
  const { error } = await supabase.from("journal_sante").delete().eq("user_id", userId).eq("jour", jour);
  if (error) return { ok: false, erreur: "La suppression a échoué." };
  refresh();
  return { ok: true };
}
