"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { messageErreurAuth } from "@/lib/supabase/erreurs";
import { createClient } from "@/lib/supabase/server";
import {
  connexionSchema,
  erreursParChamp,
  inscriptionSchema,
  type ResultatAction,
} from "@/lib/validation/auth";

async function origineSite(): Promise<string> {
  const origine = (await headers()).get("origin");
  return origine ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function inscrire(valeurs: unknown): Promise<ResultatAction> {
  const resultat = inscriptionSchema.safeParse(valeurs);
  if (!resultat.success) {
    return {
      ok: false,
      erreur: "Certains champs sont invalides.",
      champs: erreursParChamp(resultat.error),
    };
  }

  const { prenom, nom, email, motDePasse } = resultat.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: { prenom, nom },
      emailRedirectTo: `${await origineSite()}/auth/confirm`,
    },
  });

  if (error) {
    return { ok: false, erreur: messageErreurAuth(error) };
  }

  // Confirmation par email désactivée : la session est ouverte immédiatement.
  if (data.session) {
    redirect("/onboarding");
  }

  return {
    ok: true,
    message: `Un email de confirmation a été envoyé à ${email}. Ouvrez le lien qu’il contient pour activer votre compte.`,
  };
}

export async function connecter(valeurs: unknown): Promise<ResultatAction> {
  const resultat = connexionSchema.safeParse(valeurs);
  if (!resultat.success) {
    return {
      ok: false,
      erreur: "Certains champs sont invalides.",
      champs: erreursParChamp(resultat.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: resultat.data.email,
    password: resultat.data.motDePasse,
  });

  if (error) {
    return { ok: false, erreur: messageErreurAuth(error) };
  }

  redirect("/");
}

export async function deconnecter(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
