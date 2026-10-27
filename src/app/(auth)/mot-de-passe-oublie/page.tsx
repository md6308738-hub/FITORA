import type { Metadata } from "next";

import { MotDePasseOublieForm } from "@/components/auth/mot-de-passe-forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
      <p className="mt-1 mb-6 text-text-secondary">Indique ton email : tu recevras un lien pour choisir un nouveau mot de passe.</p>
      <MotDePasseOublieForm />
    </>
  );
}
