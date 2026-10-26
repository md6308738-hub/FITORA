import type { Metadata } from "next";

import { InscriptionForm } from "@/components/auth/inscription-form";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Créer votre compte</h1>
      <p className="mt-1 mb-6 text-text-secondary">
        Quelques informations pour démarrer votre suivi.
      </p>
      <InscriptionForm />
    </>
  );
}
