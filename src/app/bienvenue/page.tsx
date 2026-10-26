import type { Metadata } from "next";

import { Hero } from "@/components/vitrine/hero";
import { Navbar } from "@/components/vitrine/navbar";
import {
  AppelFinal,
  PiedDePage,
  SectionAPropos,
  SectionCoaching,
  SectionNutrition,
  SectionProgrammes,
} from "@/components/vitrine/sections";

export const metadata: Metadata = {
  title: { absolute: "FITORA · Atteins tes objectifs" },
  description: "Entraînement, nutrition et coaching pour révéler ton potentiel.",
  openGraph: {
    title: "FITORA · Atteins tes objectifs",
    description: "Entraînement, nutrition et coaching pour révéler ton potentiel.",
    images: ["/images/banniere-athlete.jpg"],
    locale: "fr_FR",
    type: "website",
  },
};

/** Page vitrine affichée aux visiteurs non connectés sur « / » (voir src/lib/supabase/proxy.ts). */
export default function BienvenuePage() {
  return (
    <div className="theme-vitrine min-h-svh">
      <a
        href="#programmes"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Passer l’animation
      </a>
      <Navbar />
      <main>
        <Hero />
        <SectionProgrammes />
        <SectionNutrition />
        <SectionCoaching />
        <SectionAPropos />
        <AppelFinal />
      </main>
      <PiedDePage />
    </div>
  );
}
