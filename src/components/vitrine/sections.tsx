import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { styleBouton } from "@/components/ui/button";
import imageMuscle from "../../../public/images/banniere-athlete.jpg";
import imageNutrition from "../../../public/images/nutrition-jollof.jpg";
import imageForce from "../../../public/images/programme-force.jpg";
import imageCardio from "../../../public/images/programme-perte-de-graisse.jpg";

function Surtitre({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.22em] text-accent-clair uppercase sm:text-sm">{children}</p>;
}

function TitreSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-3 font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl">
      {children}
    </h2>
  );
}

const PROGRAMMES: { titre: string; texte: string; image: StaticImageData; alt: string; position: string }[] = [
  {
    titre: "Prise de muscle",
    texte: "Hypertrophie progressive, du débutant à l’avancé.",
    image: imageMuscle,
    alt: "Athlète réalisant un curl avec un haltère",
    position: "object-[45%_center]",
  },
  {
    titre: "Perte de graisse",
    texte: "Cardio et renforcement, au rythme de ta semaine.",
    image: imageCardio,
    alt: "Athlète courant sur un tapis de course",
    position: "object-[60%_center]",
  },
  {
    titre: "Force et performance",
    texte: "Mouvements polyarticulaires et charges maîtrisées.",
    image: imageForce,
    alt: "Athlète saisissant une barre chargée au sol",
    position: "object-center",
  },
];

export function SectionProgrammes() {
  return (
    <section id="programmes" aria-labelledby="titre-programmes" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <Surtitre>Programmes</Surtitre>
        <TitreSection id="titre-programmes">
          Trouve <span className="text-accent">ton rythme</span>
        </TitreSection>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {PROGRAMMES.map((programme) => (
            <li key={programme.titre}>
              <Link
                href="/inscription"
                className="group relative flex aspect-[4/5] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Image
                  src={programme.image}
                  alt={programme.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${programme.position}`}
                />
                <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                <span className="relative mt-auto flex w-full items-end justify-between gap-4 p-6">
                  <span>
                    <span className="block font-display text-2xl font-extrabold uppercase">{programme.titre}</span>
                    <span className="mt-1 block text-sm text-white/80">{programme.texte}</span>
                  </span>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors group-hover:bg-accent">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                    <span className="sr-only">Commencer ce programme</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SectionNutrition() {
  return (
    <section
      id="nutrition"
      aria-labelledby="titre-nutrition"
      className="scroll-mt-20 bg-[#f7f9fc] px-5 py-24 text-[#0f172a] sm:px-8 lg:px-12 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#0a45bd] uppercase sm:text-sm">Nutrition</p>
          <h2 id="titre-nutrition" className="mt-3 font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-5xl">
            La performance se construit aussi dans l’assiette
          </h2>
          <p className="mt-6 max-w-md text-lg text-[#475467]">
            Des habitudes adaptées à tes objectifs et à ton rythme de vie.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-card">
          <Image
            src={imageNutrition}
            alt="Riz jollof servi avec des brochettes de poulet et de poivrons"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

const ETAPES_COACHING = [
  {
    titre: "Tu te présentes",
    texte: "Niveau, objectif, matériel, disponibilités, alimentation : un questionnaire court, en plusieurs étapes.",
  },
  {
    titre: "Ta semaine s’organise",
    texte: "Tes séances sont réparties selon tes jours disponibles et la durée que tu choisis.",
  },
  {
    titre: "Tu suis tes progrès",
    texte: "Poids, hydratation et statistiques calculés uniquement à partir de ce que tu enregistres.",
  },
];

export function SectionCoaching() {
  return (
    <section id="coaching" aria-labelledby="titre-coaching" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <Surtitre>Coaching</Surtitre>
        <TitreSection id="titre-coaching">
          Un accompagnement <span className="text-accent">à ta mesure</span>
        </TitreSection>
        <ol className="mt-14 grid gap-10 border-t border-border pt-10 md:grid-cols-3 md:gap-8">
          {ETAPES_COACHING.map((etape, index) => (
            <li key={etape.titre}>
              <span className="font-display text-sm font-bold text-accent">0{index + 1}</span>
              <h3 className="mt-3 font-display text-2xl font-bold">{etape.titre}</h3>
              <p className="mt-3 text-text-secondary">{etape.texte}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SectionAPropos() {
  return (
    <section id="a-propos" aria-labelledby="titre-a-propos" className="scroll-mt-20 border-t border-border px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <Surtitre>À propos</Surtitre>
        <h2 id="titre-a-propos" className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Un coach numérique né au Sénégal
        </h2>
        <p className="mt-6 text-lg text-text-secondary">
          FITORA accompagne la pratique sportive, l’alimentation et les habitudes de récupération, avec une
          interface en français pensée pour l’Afrique francophone. Ses recommandations restent indicatives :
          FITORA ne remplace ni un coach, ni un médecin, ni un diététicien.
        </p>
      </div>
    </section>
  );
}

export function AppelFinal() {
  return (
    <section aria-labelledby="titre-appel" className="relative overflow-hidden px-5 py-28 sm:px-8 lg:px-12 lg:py-40">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 mx-auto h-px max-w-7xl bg-linear-to-r from-transparent via-accent to-transparent" />
      <div className="mx-auto max-w-7xl text-center">
        <h2 id="titre-appel" className="mx-auto max-w-4xl font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-7xl">
          Prêt à passer au <span className="text-accent">niveau supérieur</span> ?
        </h2>
        <Link href="/inscription" className={`${styleBouton("primaire")} mt-10 min-h-13 rounded-full! px-8 text-base focus-visible:outline-white`}>
          Rejoindre Fitora
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}

export function PiedDePage() {
  return (
    <footer className="border-t border-border px-5 py-10 text-sm text-text-meta sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display font-extrabold text-text">FITORA</span> · Coaching sportif et nutrition
        </p>
        <Link href="/connexion" className="font-medium text-text-secondary hover:text-text focus-visible:outline-2 focus-visible:outline-accent">
          Déjà membre ? Se connecter
        </Link>
      </div>
    </footer>
  );
}
