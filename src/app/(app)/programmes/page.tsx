import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays, ChartLine, Clock3, Dumbbell, Target, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BoutonGenerer, BoutonsProposition } from "@/components/programmes/programme-boutons";
import { SeanceType } from "@/components/programmes/seance-type";
import { styleBouton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProgramme, type ProgrammeComplet } from "@/lib/data/programmes";
import { exigerProfilComplet } from "@/lib/data/session";
import { OPTIONS_NIVEAU, OPTIONS_OBJECTIF, libelle } from "@/lib/onboarding/options";
import { genererProgramme } from "@/lib/programmes/generateur";

export const metadata: Metadata = { title: "Programmes" };

export default function ProgrammesPage() {
  return (
    <div className="space-y-7">
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement du programme" className="h-64 animate-pulse rounded-card bg-surface" />}>
        <ContenuProgrammes />
      </Suspense>
    </div>
  );
}

const VISUELS_OBJECTIF = {
  prise_de_masse: { src: "/images/banniere-athlete.jpg", alt: "Athlète s’entraînant avec un haltère" },
  perte_de_poids: { src: "/images/programme-perte-de-graisse.jpg", alt: "Athlète courant sur un tapis de course" },
  force: { src: "/images/programme-force.jpg", alt: "Athlète préparant un exercice de force" },
  endurance: { src: "/images/programme-perte-de-graisse.jpg", alt: "Athlète courant sur un tapis de course" },
  maintien: { src: "/images/banniere-athlete.jpg", alt: "Athlète s’entraînant avec un haltère" },
} as const;

function BanniereProgrammes() {
  return (
    <section className="relative isolate flex min-h-64 overflow-hidden rounded-card bg-primary text-white sm:min-h-72" aria-labelledby="titre-programmes">
      <Image
        src="/images/banniere-athlete.jpg"
        alt="Athlète en plein entraînement dans une salle de sport"
        fill
        priority
        sizes="(min-width: 1280px) 1024px, 100vw"
        className="-z-20 object-cover object-[62%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-text/70" />
      <div className="flex w-full flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-semibold tracking-[0.24em] text-white/80 uppercase">Programmes FITORA</p>
        <h1 id="titre-programmes" className="mt-3 max-w-2xl font-display text-3xl leading-[0.98] font-extrabold tracking-tight uppercase sm:text-4xl lg:text-5xl">
          Des programmes <span className="text-accent-clair">pour tes objectifs</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-white/90 sm:text-base">
          Des séances construites selon ton niveau, tes disponibilités et le matériel dont tu disposes.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/90 sm:text-sm">
          <li className="inline-flex items-center gap-2"><Target aria-hidden="true" className="size-4 text-accent-clair" /> Personnalisés</li>
          <li className="inline-flex items-center gap-2"><ChartLine aria-hidden="true" className="size-4 text-accent-clair" /> Modifiables</li>
          <li className="inline-flex items-center gap-2"><Dumbbell aria-hidden="true" className="size-4 text-accent-clair" /> Exercices expliqués</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <BoutonGenerer libelle="Créer une proposition" />
          <Link href="/programmes/exercices" className={`${styleBouton("secondaire")} border-white/30 bg-white/10 text-white hover:bg-white/20`}>
            <BookOpen aria-hidden="true" className="size-4" />
            Explorer les exercices
          </Link>
        </div>
      </div>
    </section>
  );
}

function CarteProgramme({
  programme,
  statut,
  ancre,
}: {
  programme: ProgrammeComplet;
  statut: string;
  ancre: string;
}) {
  const visuel = VISUELS_OBJECTIF[programme.objectif];

  return (
    <Link
      href={`#${ancre}`}
      className="group overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative h-32 overflow-hidden bg-surface-raised">
        <Image src={visuel.src} alt={visuel.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary">{statut}</span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg leading-tight font-bold">{programme.titre}</h3>
        <p className="mt-1 text-sm text-text-secondary">{libelle(OPTIONS_OBJECTIF, programme.objectif)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-meta">
          <span className="inline-flex items-center gap-1.5"><ChartLine aria-hidden="true" className="size-4 text-primary" />{libelle(OPTIONS_NIVEAU, programme.niveau)}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-4 text-primary" />{programme.jours_par_semaine} j/sem.</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4 text-primary" />{programme.duree_seance_min} min</span>
        </div>
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">
          Voir les séances <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
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
    <div className="space-y-7">
      <BanniereProgrammes />

      <section id="tous-programmes" aria-labelledby="titre-tous-programmes" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Ton espace d’entraînement</p>
            <h2 id="titre-tous-programmes" className="mt-1 font-display text-xl font-bold">Tes programmes</h2>
          </div>
          <Link href="/programmes/exercices" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Bibliothèque d’exercices <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <nav aria-label="Accès rapide aux programmes" className="flex flex-wrap gap-2">
          <a href="#tous-programmes" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary">Tous</a>
          {propose ? <a href="#proposition" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Proposition</a> : null}
          {actif ? <a href="#programme-actif" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Programme actif</a> : null}
        </nav>

        {actif || propose ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {propose ? <CarteProgramme programme={propose} statut="À valider" ancre="proposition" /> : null}
            {actif ? <CarteProgramme programme={actif} statut="Actif" ancre="programme-actif" /> : null}
          </div>
        ) : (
          <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
            <EmptyState
              title="Ton premier programme reste à créer"
              description="FITORA prépare une proposition en fonction de ton profil. Tu pourras vérifier chaque séance avant de l’activer."
            />
            <div className="mt-4 flex justify-center"><BoutonGenerer /></div>
          </div>
        )}
      </section>

      {propose ? (
        <section id="proposition" aria-labelledby="titre-proposition" className="scroll-mt-6 space-y-4">
          <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
            <p className="text-sm font-semibold text-primary">Proposition à valider</p>
            <h2 id="titre-proposition" className="mt-1 font-display text-xl font-bold">{propose.titre}</h2>
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
        <section id="programme-actif" aria-labelledby="titre-actif" className="scroll-mt-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Programme actif</p>
              <h2 id="titre-actif" className="font-display text-xl font-bold">
                {actif.titre}
              </h2>
            </div>
            {propose ? null : <BoutonGenerer libelle="Demander une nouvelle proposition" />}
          </div>
          {!propose &&
          (actif.objectif !== profil.objectif ||
            actif.niveau !== profil.niveau ||
            actif.jours_par_semaine !== profil.jours_par_semaine ||
            actif.duree_seance_min !== profil.duree_seance_min) ? (
            <p role="status" className="flex gap-2 rounded-xl border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-text">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              Ton profil a changé depuis la création de ce programme : demande une nouvelle proposition pour l’adapter.
            </p>
          ) : null}
          <ListeSeances programme={actif} modifiable />
        </section>
      ) : null}

    </div>
  );
}
