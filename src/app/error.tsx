"use client";

import { Button } from "@/components/ui/button";

/** Erreur inattendue d'une page : message lisible et possibilité de réessayer. */
export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const configuration = error.message.startsWith("Configuration Supabase manquante");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-card border border-border bg-surface p-6">
        <h1 className="text-xl font-bold">Un problème est survenu</h1>
        <p className="mt-2 text-text-secondary">
          {configuration
            ? "L’application n’est pas encore reliée à sa base de données. Renseignez les variables Supabase dans .env.local puis relancez le serveur."
            : "La page n’a pas pu être chargée. Vérifiez votre connexion puis réessayez."}
        </p>
        <Button className="mt-6" onClick={reset}>
          Réessayer
        </Button>
      </div>
    </main>
  );
}
