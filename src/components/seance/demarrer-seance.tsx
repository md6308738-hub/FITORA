"use client";

import { Play } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { demarrerSeance } from "@/app/(app)/seance/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

/**
 * Démarre une séance. L'identifiant est créé au clic et conservé en cas de nouvelle tentative
 * après une erreur (pas de doublon), puis renouvelé une fois la séance créée.
 */
export function DemarrerSeance({ programmeSeanceId, libelle = "Démarrer la séance" }: { programmeSeanceId: string; libelle?: string }) {
  const identifiant = useRef<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      <Button
        enCours={enCours}
        onClick={() => {
          setErreur(null);
          startTransition(async () => {
            identifiant.current ??= crypto.randomUUID();
            const reponse = await demarrerSeance(identifiant.current, programmeSeanceId);
            if (reponse.ok) identifiant.current = null;
            else setErreur(reponse.erreur);
          });
        }}
      >
        {enCours ? null : <Play aria-hidden="true" className="size-4" />}
        {libelle}
      </Button>
      {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
    </div>
  );
}
