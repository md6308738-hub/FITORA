import { BookOpen, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BoutonGenerer, BoutonsProposition } from "@/components/programmes/programme-boutons";
import { SeanceType } from "@/components/programmes/seance-type";
import { styleBouton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getProgramme, type ProgrammeComplet } from "@/lib/data/programmes";
import { exigerProfilComplet } from "@/lib/data/session";
import { genererProgramme } from "@/lib/programmes/generateur";

export const metadata: Metadata = { title: "Programmes" };

export default function ProgrammesPage() {
  return (
    <>
      <PageHeader title="Programmes" description="Ton programme d’entraînement, adapté à tes réponses." />
      <Link href="/programmes/exercices" className={`${styleBouton("secondaire")} mb-6`}>
        <BookOpen aria-hidden="true" className="size-4" />
        Bibliothèque d’exercices
      </Link>
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement du programme" className="h-64 animate-pulse rounded-card bg-surface" />}>
        <ContenuProgrammes />
      </Suspense>
    </>
  );
}

function ListeSeances({ programme, modifiable }: { programme: ProgrammeComplet; modifiable: boolean }) {
  const seances = [...programme.seances].sort((a, b) => a.jour_semaine - b.jour_semaine || a.ordre - b.ordre);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {seances.map((seance) => (
        <SeanceType key={seance.id} seance={seance} modifiable={modifiable} />
      ))}
    </div>
  );
}

async function ContenuProgrammes() {
  const profil = await exigerProfilComplet();
  const [actif, propose] = await Promise.all([getProgramme("actif"), getProgramme("propose")]);
  // Les avertissements dépendent du profil actuel ; ils ne sont pas stockés.
  const avertissements = genererProgramme({
    objectif: profil.objectif ?? "maintien",
    niveau: profil.niveau ?? "debutant",
    joursParSemaine: profil.jours_par_semaine ?? 3,
    dureeSeanceMin: profil.duree_seance_min ?? 45,
    materiel: profil.materiel ?? "aucun",
    blessures: profil.blessures,
  }).avertissements;

  return (
    <div className="space-y-10">
      {propose ? (
        <section aria-labelledby="titre-proposition" className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-primary">Proposition à valider</p>
            <h2 id="titre-proposition" className="font-display text-xl font-bold">
              {propose.titre}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Vérifie les séances proposées : tu pourras ensuite changer les jours et remplacer des exercices.
            </p>
          </div>
          {avertissements.map((texte) => (
            <p key={texte} className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
              {texte}
            </p>
          ))}
          <ListeSeances programme={propose} modifiable={false} />
          <BoutonsProposition programmeId={propose.id} />
        </section>
      ) : null}

      {actif ? (
        <section aria-labelledby="titre-actif" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Programme actif</p>
              <h2 id="titre-actif" className="font-display text-xl font-bold">
                {actif.titre}
              </h2>
            </div>
            {propose ? null : <BoutonGenerer libelle="Demander une nouvelle proposition" />}
          </div>
          <ListeSeances programme={actif} modifiable />
        </section>
      ) : null}

      {!actif && !propose ? (
        <div className="space-y-4">
          <EmptyState
            title="Aucun programme pour l’instant"
            description="FITORA compose un programme à partir de ton objectif, de ton niveau, de tes jours disponibles et de ton matériel. Tu le valides avant de commencer."
          />
          <BoutonGenerer />
        </div>
      ) : null}
    </div>
  );
}
