import type { Metadata } from "next";

import { LogoutButton } from "@/components/auth/logout-button";
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
        title="Profil en préparation"
        description="La modification de vos informations arrivera prochainement. Vos réponses au questionnaire sont enregistrées."
      />
      <div className="mt-6 max-w-xs">
        <LogoutButton className="border border-border" />
      </div>
    </>
  );
}
