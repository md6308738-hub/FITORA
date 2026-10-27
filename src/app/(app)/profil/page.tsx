import { Download, LogOut } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { deconnecterPartout } from "@/app/(auth)/actions";
import { LogoutButton } from "@/components/auth/logout-button";
import { NouveauMotDePasseForm } from "@/components/auth/mot-de-passe-forms";
import { ConsentementSante, IdentiteForm, SectionsProfil, SuppressionCompte } from "@/components/profil/profil-forms";
import { styleBouton } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet } from "@/lib/data/session";
import { valeursInitiales } from "@/lib/onboarding/valeurs-initiales";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <>
      <PageHeader title="Profil" description="Tes informations, ta sécurité et tes données." />
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement du profil" className="h-96 animate-pulse rounded-card bg-surface" />}>
        <ContenuProfil />
      </Suspense>
    </>
  );
}

async function ContenuProfil() {
  const profil = await exigerProfilComplet();
  const pesees = await getPesees();
  const valeurs = valeursInitiales(profil, pesees.at(-1)?.poids_kg ?? null);

  return (
    <div className="space-y-6">
      <Card aria-labelledby="titre-identite">
        <CardTitle id="titre-identite">Informations personnelles</CardTitle>
        <div className="mt-4">
          <IdentiteForm valeurs={{ prenom: profil.prenom, nom: profil.nom }} />
        </div>
      </Card>

      <section aria-labelledby="titre-sportif" className="space-y-3">
        <h2 id="titre-sportif" className="font-display text-xl font-bold">Profil sportif et habitudes</h2>
        <p className="text-sm text-text-secondary">
          Modifier ton objectif, tes disponibilités ou ton matériel ne change pas ton programme actuel : tu pourras demander
          une nouvelle proposition depuis la page Entraînement.
        </p>
        <SectionsProfil valeurs={valeurs} />
      </section>

      <Card aria-labelledby="titre-sante">
        <CardTitle id="titre-sante">Données de santé</CardTitle>
        <div className="mt-4">
          <ConsentementSante donneLe={profil.consentement_sante_le} />
        </div>
      </Card>

      <Card aria-labelledby="titre-securite">
        <CardTitle id="titre-securite">Sécurité</CardTitle>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Changer de mot de passe</h3>
            <NouveauMotDePasseForm apresSucces={null} />
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
            <form action={deconnecterPartout}>
              <button type="submit" className={styleBouton("secondaire")}>
                <LogOut aria-hidden="true" className="size-4" />
                Se déconnecter de tous les appareils
              </button>
            </form>
            <div className="sm:w-56">
              <LogoutButton className="border border-border" />
            </div>
          </div>
        </div>
      </Card>

      <Card aria-labelledby="titre-donnees">
        <CardTitle id="titre-donnees">Mes données</CardTitle>
        <p className="mt-3 text-sm text-text-secondary">
          Télécharge l’ensemble de tes données (profil, séances, mesures, repas, santé) au format JSON.
        </p>
        <a href="/profil/export" className={`${styleBouton("secondaire")} mt-4`}>
          <Download aria-hidden="true" className="size-4" />
          Exporter mes données
        </a>
        <div className="mt-6 border-t border-border pt-5">
          <SuppressionCompte />
        </div>
      </Card>
    </div>
  );
}
