"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { messageErreurAuth } from "@/lib/supabase/erreurs";
import { createClient } from "@/lib/supabase/server";
import {
  connexionSchema,
  emailSeulSchema,
  erreursParChamp,
  inscriptionSchema,
  nouveauMotDePasseSchema,
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

/** Envoie un lien de réinitialisation. La réponse est identique que le compte existe ou non. */
export async function demanderReinitialisation(valeurs: unknown): Promise<ResultatAction> {
  const resultat = emailSeulSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { ok: false, erreur: "Adresse email invalide.", champs: erreursParChamp(resultat.error) };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(resultat.data.email, {
    redirectTo: `${await origineSite()}/auth/confirm?suivant=/nouveau-mot-de-passe`,
  });
  if (error && (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit")) {
    return { ok: false, erreur: messageErreurAuth(error) };
  }
  return {
    ok: true,
    message: "Si un compte existe avec cette adresse, un lien pour choisir un nouveau mot de passe vient d’être envoyé.",
  };
}

/** Définit un nouveau mot de passe (après le lien reçu par email, ou depuis le profil). */
export async function changerMotDePasse(valeurs: unknown): Promise<ResultatAction> {
  const resultat = nouveauMotDePasseSchema.safeParse(valeurs);
  if (!resultat.success) {
    return { ok: false, erreur: "Certains champs sont invalides.", champs: erreursParChamp(resultat.error) };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: resultat.data.motDePasse });
  if (error) {
    return {
      ok: false,
      erreur:
        error.code === "same_password"
          ? "Choisis un mot de passe différent de l’actuel."
          : error.code === "reauthentication_needed"
            ? "Pour des raisons de sécurité, reconnecte-toi puis recommence."
            : messageErreurAuth(error),
    };
  }
  return { ok: true, message: "Ton mot de passe a été modifié." };
}

/** Ferme toutes les sessions ouvertes, sur tous les appareils. */
export async function deconnecterPartout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/connexion");
}
