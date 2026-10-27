import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../src/types/database";

/**
 * Outils de test : la clé secrète (SUPABASE_SECRET_KEY, .env.local) sert
 * uniquement à créer puis supprimer des comptes de test confirmés.
 */
export const supabaseConfigure = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
);

function admin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SECRET_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const MOT_DE_PASSE_TEST = "motdepasse1";

export function emailTest(etiquette: string): string {
  const domaine = process.env.E2E_EMAIL_DOMAIN ?? "example.com";
  return `e2e-${etiquette}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@${domaine}`;
}

/** Crée un compte déjà confirmé (le déclencheur SQL crée son profil). */
export async function creerUtilisateurConfirme(prenom: string, nom: string) {
  const email = emailTest(prenom.toLowerCase());
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: MOT_DE_PASSE_TEST,
    email_confirm: true,
    user_metadata: { prenom, nom },
  });
  if (error || !data.user) throw error ?? new Error("Création impossible");
  return { id: data.user.id, email };
}

/** Supprime un compte de test ; ses données partent en cascade. */
export async function supprimerUtilisateur(id: string) {
  await admin().auth.admin.deleteUser(id);
}

export async function supprimerUtilisateurParEmail(email: string) {
  const { data } = await admin().auth.admin.listUsers({ perPage: 1000 });
  const utilisateur = data.users.find((u) => u.email === email);
  if (utilisateur) await supprimerUtilisateur(utilisateur.id);
}

/** Client « utilisateur ordinaire » (clé publique + session), soumis à la RLS. */
export async function clientConnecte(email: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await client.auth.signInWithPassword({ email, password: MOT_DE_PASSE_TEST });
  if (error) throw error;
  return client;
}

/** Remplit le questionnaire d'un compte de test (raccourci pour les parcours qui le supposent terminé). */
export async function completerProfil(id: string, valeurs: Partial<Database["public"]["Tables"]["profils"]["Update"]> = {}) {
  const { error } = await admin()
    .from("profils")
    .update({
      age: 29,
      taille_cm: 175,
      sexe: "homme",
      objectif: "prise_de_masse",
      niveau: "intermediaire",
      activites: ["musculation"],
      jours_par_semaine: 3,
      duree_seance_min: 45,
      materiel: "salle",
      niveau_activite: "modere",
      onboarding_etape: 9,
      onboarding_termine_le: new Date().toISOString(),
      ...valeurs,
    })
    .eq("id", id);
  if (error) throw error;
  // Une pesée du jour, comme après le questionnaire (nécessaire aux estimations nutritionnelles).
  const { error: erreurPesee } = await admin()
    .from("pesees")
    .insert({ user_id: id, mesure_le: new Date().toISOString().slice(0, 10), poids_kg: 80 });
  if (erreurPesee) throw erreurPesee;
}
