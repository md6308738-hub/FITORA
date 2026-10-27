import type { Metadata } from "next";

import { NouveauMotDePasseForm } from "@/components/auth/mot-de-passe-forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function NouveauMotDePassePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1>
      <p className="mt-1 mb-6 text-text-secondary">Choisis ton nouveau mot de passe.</p>
      <NouveauMotDePasseForm />
    </>
  );
}
