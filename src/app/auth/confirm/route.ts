import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Lien de confirmation reçu par email : ouvre la session puis envoie vers le questionnaire. */
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

  const cible = request.nextUrl.clone();
  cible.search = "";
  cible.pathname = reussi ? "/onboarding" : "/connexion";
  if (!reussi) {
    cible.searchParams.set("erreur", "lien-invalide");
  }
  return NextResponse.redirect(cible);
}
