import type { Metadata } from "next";
import { Suspense } from "react";

import { AccueilPremium } from "@/components/dashboard/accueil-premium";
import { TableauDeBordChargement } from "@/components/dashboard/tableau-de-bord";

export const metadata: Metadata = { title: "Accueil" };

export default function HomePage() {
  return (
    // Les données dépendent de la session : elles arrivent après la requête.
    <Suspense fallback={<TableauDeBordChargement />}>
      <AccueilPremium />
    </Suspense>
  );
}
