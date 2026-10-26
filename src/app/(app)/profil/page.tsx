import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <>
      <PageHeader
        title="Profil"
        description="Vos informations personnelles."
      />
      <EmptyState
        title="Profil incomplet"
        description="Les informations de votre profil apparaîtront ici."
      />
    </>
  );
}
