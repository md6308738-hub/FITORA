import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getPesees } from "@/lib/data/pesees";
import { getProfil } from "@/lib/data/session";
import { etapeDeReprise, valeursInitiales } from "@/lib/onboarding/valeurs-initiales";

export const metadata: Metadata = { title: "Questionnaire de démarrage" };

export default function OnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-8 sm:py-14">
      <p className="mb-8 w-full max-w-2xl font-display text-xl font-extrabold tracking-tight text-primary">
        FITORA
      </p>
      <main className="w-full max-w-2xl">
        <Suspense fallback={<Chargement />}>
          <Questionnaire />
        </Suspense>
      </main>
    </div>
  );
}

async function Questionnaire() {
  const profil = await getProfil();
  if (profil.onboarding_termine_le) {
    redirect("/");
  }
  const pesees = await getPesees();
  const dernierPoids = pesees.at(-1)?.poids_kg ?? null;

  return (
    <OnboardingWizard
      etapeInitiale={etapeDeReprise(profil)}
      valeursInitiales={valeursInitiales(profil, dernierPoids)}
    />
  );
}

function Chargement() {
  return (
    <div aria-busy="true" aria-label="Chargement du questionnaire" className="space-y-4">
      <div className="h-2 animate-pulse rounded-full bg-surface-raised" />
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface-raised" />
      <div className="h-40 animate-pulse rounded-card bg-surface-raised" />
    </div>
  );
}
