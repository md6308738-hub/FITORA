import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Bibliotheque } from "@/components/programmes/bibliotheque";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Bibliothèque d’exercices" };

export default function ExercicesPage() {
  return (
    <>
      <Link href="/programmes" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Programmes
      </Link>
      <PageHeader title="Bibliothèque d’exercices" description="Consignes, précautions et alternatives pour chaque mouvement." />
      <Bibliotheque />
    </>
  );
}
