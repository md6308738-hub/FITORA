"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { enregistrerEtape } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ETAPES, NOMBRE_ETAPES, type EtapeId } from "@/lib/onboarding/etapes";

import { EtapeChamps, type ValeursEtape } from "./etape-champs";

type OnboardingWizardProps = {
  etapeInitiale: number;
  valeursInitiales: Record<EtapeId, ValeursEtape>;
};

export function OnboardingWizard({ etapeInitiale, valeursInitiales }: OnboardingWizardProps) {
  const [index, setIndex] = useState(etapeInitiale);
  const [valeurs, setValeurs] = useState(valeursInitiales);

  const etape = ETAPES[index] ?? ETAPES[0];

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-text-secondary">
            Étape {index + 1} sur {NOMBRE_ETAPES}
          </span>
          <span className="text-text-meta">{Math.round((index / NOMBRE_ETAPES) * 100)} %</span>
        </div>
        <ProgressBar valeur={(index / NOMBRE_ETAPES) * 100} label="Progression du questionnaire" />
      </div>

      {/* La clé recrée le formulaire à chaque étape avec ses propres valeurs. */}
      <FormulaireEtape
        key={etape.id}
        index={index}
        valeursParDefaut={valeurs[etape.id]}
        onRetour={() => setIndex((i) => Math.max(0, i - 1))}
        onEnregistre={(saisies) => {
          setValeurs((precedentes) => ({ ...precedentes, [etape.id]: saisies }));
          setIndex((i) => Math.min(NOMBRE_ETAPES - 1, i + 1));
        }}
      />
    </div>
  );
}

type FormulaireEtapeProps = {
  index: number;
  valeursParDefaut: ValeursEtape;
  onRetour: () => void;
  onEnregistre: (valeurs: ValeursEtape) => void;
};

function FormulaireEtape({ index, valeursParDefaut, onRetour, onEnregistre }: FormulaireEtapeProps) {
  const etape = ETAPES[index] ?? ETAPES[0];
  const derniere = index === NOMBRE_ETAPES - 1;
  const [enCours, startTransition] = useTransition();
  const [action, setAction] = useState<"continuer" | "passer">("continuer");
  const [erreur, setErreur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<ValeursEtape>({
    resolver: zodResolver(etape.schema) as unknown as Resolver<ValeursEtape>,
    defaultValues: valeursParDefaut,
    mode: "onTouched",
  });

  const envoyer = (saisies: ValeursEtape, type: "continuer" | "passer") => {
    setErreur(null);
    setAction(type);
    startTransition(async () => {
      // À la dernière étape, l'action redirige vers l'accueil.
      const reponse = await enregistrerEtape(index, saisies);
      if (!reponse.ok) {
        setErreur(reponse.erreur);
        for (const [champ, message] of Object.entries(reponse.champs ?? {})) {
          setError(champ, { message });
        }
        return;
      }
      // On conserve les saisies brutes pour pré-remplir l'étape en cas de retour.
      onEnregistre(type === "passer" ? {} : getValues());
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit((saisies) => envoyer(saisies, "continuer"))}
      className="animate-apparition"
    >
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{etape.titre}</h1>
      <p className="mt-1 mb-6 text-text-secondary">{etape.description}</p>

      <div className="space-y-6">
        {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
        <EtapeChamps id={etape.id} register={register} errors={errors} />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <Button variante="discret" onClick={onRetour} disabled={index === 0 || enCours}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          Retour
        </Button>
        <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
          {etape.facultative ? (
            <Button
              variante="secondaire"
              disabled={enCours}
              enCours={enCours && action === "passer"}
              onClick={() => envoyer({}, "passer")}
            >
              Passer
            </Button>
          ) : null}
          <Button type="submit" enCours={enCours && action === "continuer"} disabled={enCours}>
            {derniere ? "Terminer" : "Continuer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
