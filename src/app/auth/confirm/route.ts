import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Lien reçu par email (confirmation ou réinitialisation) : ouvre la session puis redirige. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let reussi = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    reussi = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    reussi = !error;
  }

  // Destinations autorisées après le lien (pas de redirection ouverte).
  const suivant = searchParams.get("suivant");
  const destination = suivant === "/nouveau-mot-de-passe" || type === "recovery" ? "/nouveau-mot-de-passe" : "/onboarding";

  const cible = request.nextUrl.clone();
  cible.search = "";
  cible.pathname = reussi ? destination : "/connexion";
  if (!reussi) {
    cible.searchParams.set("erreur", "lien-invalide");
  }
  return NextResponse.redirect(cible);
}
