import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Accueil" };

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Accueil"
        description="Votre tableau de bord MOVA."
      />
      <EmptyState
        title="Aucune donnée pour le moment"
        description="Votre résumé de la semaine apparaîtra ici dès que vous aurez enregistré vos premières séances."
      />
    </>
  );
}
