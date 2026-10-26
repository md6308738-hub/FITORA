import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

import { isSupabaseConfigured, getSupabaseEnv } from "./env";

/** Pages accessibles sans être connecté. */
const ROUTES_PUBLIQUES = ["/connexion", "/inscription", "/auth"];
/** Pages réservées aux visiteurs non connectés. */
const ROUTES_INVITE = ["/connexion", "/inscription"];

function commencePar(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Rafraîchit la session Supabase et applique les redirections « optimistes ».
 * La vraie protection des données reste la sécurité par ligne (RLS).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sans configuration, on laisse passer : les pages affichent l'erreur de configuration.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Ne rien exécuter entre la création du client et getClaims() : cela valide et rafraîchit la session.
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  const redirection = (chemin: string) => {
    const cible = request.nextUrl.clone();
    cible.pathname = chemin;
    cible.search = "";
    const reponse = NextResponse.redirect(cible);
    for (const cookie of response.cookies.getAll()) {
      reponse.cookies.set(cookie);
    }
    return reponse;
  };

  if (!connecte && !commencePar(pathname, ROUTES_PUBLIQUES)) {
    return redirection("/connexion");
  }
  if (connecte && commencePar(pathname, ROUTES_INVITE)) {
    return redirection("/");
  }

  return response;
}
