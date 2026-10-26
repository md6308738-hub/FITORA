"use client";

import { Plus, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";

import { ajouterEau, annulerDerniereEau } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { QUANTITES_EAU_ML } from "@/lib/validation/suivi";

export function HydrationControls({ peutAnnuler }: { peutAnnuler: boolean }) {
  const [enCours, startTransition] = useTransition();
  const [cible, setCible] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const executer = (cle: string, action: () => Promise<{ ok: boolean; erreur?: string }>) => {
    setErreur(null);
    setCible(cle);
    startTransition(async () => {
      const reponse = await action();
      if (!reponse.ok) setErreur(reponse.erreur ?? "Une erreur est survenue.");
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {QUANTITES_EAU_ML.map((ml) => (
          <Button
            key={ml}
            variante="secondaire"
            disabled={enCours}
            enCours={enCours && cible === String(ml)}
            onClick={() => executer(String(ml), () => ajouterEau(ml))}
          >
            {enCours && cible === String(ml) ? null : <Plus aria-hidden="true" className="size-4" />}
            {ml} ml
          </Button>
        ))}
        <Button
          variante="discret"
          disabled={enCours || !peutAnnuler}
          enCours={enCours && cible === "annuler"}
          onClick={() => executer("annuler", annulerDerniereEau)}
        >
          {enCours && cible === "annuler" ? null : <Undo2 aria-hidden="true" className="size-4" />}
          Annuler
        </Button>
      </div>
      {erreur ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
