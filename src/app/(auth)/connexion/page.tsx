import type { Metadata } from "next";
import { Suspense } from "react";

import { ConnexionForm } from "@/components/auth/connexion-form";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Bon retour</h1>
      <p className="mt-1 mb-6 text-text-secondary">
        Connectez-vous pour retrouver votre suivi.
      </p>
      {/* Le formulaire lit les paramètres d'URL : il s'affiche après la requête. */}
      <Suspense fallback={<div className="h-72" aria-hidden="true" />}>
        <ConnexionForm />
      </Suspense>
    </>
  );
}
