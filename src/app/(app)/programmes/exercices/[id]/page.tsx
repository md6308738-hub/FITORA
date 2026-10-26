import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardTitle } from "@/components/ui/card";
import { CATALOGUE, LIBELLES_MATERIEL, alternatives, trouverExercice } from "@/lib/exercices/catalogue";
import { OPTIONS_NIVEAU, libelle } from "@/lib/onboarding/options";

export function generateStaticParams() {
  return CATALOGUE.map((exercice) => ({ id: exercice.id }));
}

export async function generateMetadata({ params }: PageProps<"/programmes/exercices/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: trouverExercice(id)?.nom ?? "Exercice" };
}

export default async function FicheExercicePage({ params }: PageProps<"/programmes/exercices/[id]">) {
  const { id } = await params;
  const exercice = trouverExercice(id);
  if (!exercice) notFound();

  return (
    <>
      <Link href="/programmes/exercices" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Bibliothèque
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{exercice.nom}</h1>
        <p className="mt-1 text-text-secondary">
          {exercice.groupe}
          {exercice.secondaires.length > 0 ? ` · ${exercice.secondaires.join(", ")}` : ""}
        </p>
        <p className="mt-3 flex flex-wrap gap-2 text-sm">
          {exercice.materiel.map((m) => (
            <span key={m} className="rounded-full bg-primary-soft px-3 py-1 font-medium text-primary">
              {LIBELLES_MATERIEL[m]}
            </span>
          ))}
          <span className="rounded-full bg-surface-raised px-3 py-1 text-text-secondary">{libelle(OPTIONS_NIVEAU, exercice.niveau)}</span>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card aria-labelledby="titre-consignes" className="lg:col-span-2">
          <CardTitle id="titre-consignes">Exécution</CardTitle>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {exercice.consignes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-text-meta">
            Pas encore de vidéo pour cet exercice : ces consignes ne remplacent pas la démonstration d’un professionnel.
          </p>
        </Card>
        {exercice.precautions.length > 0 ? (
          <Card aria-labelledby="titre-precautions">
            <CardTitle id="titre-precautions">Précautions</CardTitle>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {exercice.precautions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
        ) : null}
        <Card aria-labelledby="titre-erreurs">
          <CardTitle id="titre-erreurs">Erreurs courantes</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {exercice.erreurs.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card aria-labelledby="titre-alternatives" className="lg:col-span-2">
          <CardTitle id="titre-alternatives">Alternatives</CardTitle>
          <ul className="mt-3 flex flex-wrap gap-2">
            {alternatives(exercice).map((a) => (
              <li key={a.id}>
                <Link href={`/programmes/exercices/${a.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-sm hover:border-primary hover:text-primary">
                  {a.nom}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
