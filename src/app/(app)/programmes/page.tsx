import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Programmes" };

export default function ProgrammesPage() {
  return (
    <>
      <PageHeader
        title="Programmes"
        description="Vos programmes d’entraînement."
      />
      <EmptyState
        title="Aucun programme"
        description="Vous n’avez pas encore de programme d’entraînement."
      />
    </>
  );
}
