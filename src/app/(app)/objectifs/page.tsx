import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Objectifs" };

export default function ObjectifsPage() {
  return (
    <>
      <PageHeader
        title="Objectifs"
        description="Vos objectifs personnels."
      />
      <EmptyState
        title="Aucun objectif"
        description="Vous n’avez pas encore défini d’objectif."
      />
    </>
  );
}
