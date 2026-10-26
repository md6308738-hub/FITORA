"use client";

import { useState, useTransition } from "react";

import { proposerProgramme, validerProgramme } from "@/app/(app)/programmes/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import type { ResultatAction } from "@/lib/validation/auth";

type Action = { cle: string; libelle: string; variante?: "primaire" | "secondaire"; executer: () => Promise<ResultatAction> };

function GroupeBoutons({ actions }: { actions: Action[] }) {
  const [enCours, startTransition] = useTransition();
  const [active, setActive] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {actions.map((action) => (
          <Button
            key={action.cle}
            variante={action.variante}
            disabled={enCours}
            enCours={enCours && active === action.cle}
            onClick={() => {
              setErreur(null);
              setActive(action.cle);
              startTransition(async () => {
                const reponse = await action.executer();
                if (!reponse.ok) setErreur(reponse.erreur);
              });
            }}
          >
            {action.libelle}
          </Button>
        ))}
      </div>
      {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
    </div>
  );
}

export function BoutonGenerer({ libelle = "Générer mon programme" }: { libelle?: string }) {
  return <GroupeBoutons actions={[{ cle: "generer", libelle, executer: () => proposerProgramme(false) }]} />;
}

export function BoutonsProposition({ programmeId }: { programmeId: string }) {
  return (
    <GroupeBoutons
      actions={[
        { cle: "valider", libelle: "Valider ce programme", executer: () => validerProgramme(programmeId) },
        { cle: "autre", libelle: "Proposer une autre version", variante: "secondaire", executer: () => proposerProgramme(true) },
      ]}
    />
  );
}
