import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Séance" };

export default function SeancePage() {
  return (
    <>
      <PageHeader
        title="Séance"
        description="Suivez votre séance du jour."
      />
      <EmptyState
        title="Aucune séance prévue"
        description="Aucune séance n’est prévue pour aujourd’hui."
      />
    </>
  );
}
