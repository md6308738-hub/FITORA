import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Progression" };

export default function ProgressionPage() {
  return (
    <>
      <PageHeader
        title="Progression"
        description="L’évolution de vos mesures et de vos performances."
      />
      <EmptyState
        title="Aucune mesure enregistrée"
        description="Vos graphiques de progression apparaîtront ici à partir de vos données enregistrées."
      />
    </>
  );
}
