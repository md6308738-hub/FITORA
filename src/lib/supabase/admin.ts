import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

/**
 * Client administrateur (clé secrète, contourne la RLS). Serveur uniquement, réservé
 * aux opérations qu'un utilisateur ne peut pas faire lui-même (suppression de son compte).
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY manquante : la suppression de compte est indisponible.");
  }
  return createClient<Database>(getSupabaseEnv().url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client sans session ni cookies, pour vérifier un mot de passe sans toucher à la session courante. */
export function createClientVerification() {
  const { url, publishableKey } = getSupabaseEnv();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
