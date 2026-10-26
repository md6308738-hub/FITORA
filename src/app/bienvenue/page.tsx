import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { styleBouton } from "@/components/ui/button";
import banniere from "../../../public/images/banniere-athlete.jpg";

export const metadata: Metadata = {
  title: { absolute: "FITORA · Atteins tes objectifs" },
  description:
    "Entraînement, nutrition et suivi personnalisés selon ton niveau, ton temps et ton matériel.",
};

/** Page vitrine affichée aux visiteurs non connectés sur « / » (voir src/lib/supabase/proxy.ts). */
export default function BienvenuePage() {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-black text-white">
      {/* Photo : Luke Witter, Unsplash (docs/credits-medias.md). */}
      <Image
        src={banniere}
        alt="Athlète travaillant les biceps avec un haltère dans une salle de sport"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="animate-recul -z-20 object-cover object-[42%_center]"
      />
      {/* Voile pour la lisibilité du texte, plus dense en bas et à gauche. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-black/20 lg:bg-linear-to-r lg:from-black/80 lg:via-black/40 lg:to-black/5"
      />

      <header className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-10 lg:px-16">
        <span className="font-display text-2xl font-extrabold tracking-tight">FITORA</span>
      </header>

      <div className="mt-auto px-6 pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:px-10 lg:my-auto lg:px-16 lg:pb-0">
        <div className="max-w-xl">
          <h1 className="animate-apparition font-display text-5xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-7xl">
            Atteins tes objectifs
          </h1>
          <p className="mt-5 max-w-md animate-apparition text-base text-white/85 [animation-delay:120ms] sm:text-lg">
            Entraînement, nutrition et suivi personnalisés selon ton niveau, ton temps et ton
            matériel.
          </p>
          <div className="mt-8 flex animate-apparition flex-col items-start gap-4 [animation-delay:240ms] sm:flex-row sm:items-center">
            <Link
              href="/inscription"
              className={`${styleBouton("primaire")} min-h-12 px-7 text-base focus-visible:outline-white`}
            >
              Commencer maintenant
            </Link>
            <Link
              href="/connexion"
              className="inline-flex min-h-11 items-center text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Déjà membre ? Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
