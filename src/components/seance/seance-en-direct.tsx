"use client";

import { Check, Plus, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { annulerSeance, enregistrerSerie, terminerSeance } from "@/app/(app)/seance/actions";
import { IllustrationExerciceParId } from "@/components/exercices/illustration-exercice";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { trouverExercice } from "@/lib/exercices/catalogue";

export type ExerciceSeance = {
  exerciceId: string;
  nom: string;
  mesure: "repetitions" | "duree";
  series: number;
  reposSec: number;
  prescription: string;
  /** Rappel de la dernière séance, ex. « 3 × 10 à 40 kg ». */
  derniereFois: string | null;
  suggestion: { chargeKg: number | null; raison: string } | null;
  enregistrees: { numero: number; chargeKg: number | null; repetitions: number | null; dureeSec: number | null }[];
};

type Props = { seanceId: string; nom: string; commenceeLe: string; exercices: ExerciceSeance[] };

const CHAMP =
  "min-h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-base text-text focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary";

const nombre = (texte: string) => {
  const valeur = Number(texte.replace(",", "."));
  return texte.trim() === "" || Number.isNaN(valeur) ? null : valeur;
};

function LigneSerie({
  seanceId,
  exercice,
  numero,
  initiale,
  onValidee,
}: {
  seanceId: string;
  exercice: ExerciceSeance;
  numero: number;
  initiale?: ExerciceSeance["enregistrees"][number];
  onValidee: () => void;
}) {
  const chargeProposee = initiale?.chargeKg ?? exercice.suggestion?.chargeKg ?? null;
  const [charge, setCharge] = useState(chargeProposee === null ? "" : String(chargeProposee).replace(".", ","));
  const [valeur, setValeur] = useState(
    String((exercice.mesure === "duree" ? initiale?.dureeSec : initiale?.repetitions) ?? ""),
  );
  const [validee, setValidee] = useState(Boolean(initiale));
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const id = `${exercice.exerciceId}-${numero}`;

  const valider = () => {
    setErreur(null);
    const quantite = nombre(valeur);
    if (quantite === null) {
      setErreur(exercice.mesure === "duree" ? "Indique la durée en secondes." : "Indique le nombre de répétitions.");
      return;
    }
    startTransition(async () => {
      const reponse = await enregistrerSerie({
        seanceId,
        exerciceId: exercice.exerciceId,
        numero,
        chargeKg: exercice.mesure === "duree" ? null : nombre(charge),
        repetitions: exercice.mesure === "duree" ? null : Math.round(quantite),
        dureeSec: exercice.mesure === "duree" ? Math.round(quantite) : null,
      });
      if (reponse.ok) {
        setValidee(true);
        onValidee();
      } else {
        setErreur(reponse.erreur);
      }
    });
  };

  return (
    <li className="py-3">
      <div className="flex items-end gap-2">
        <span className="mb-3 w-8 shrink-0 text-sm font-semibold text-text-meta">S{numero}</span>
        {exercice.mesure === "repetitions" ? (
          <label className="flex-1 text-xs text-text-meta" htmlFor={`${id}-charge`}>
            Charge (kg)
            <input id={`${id}-charge`} inputMode="decimal" className={`${CHAMP} mt-1`} value={charge} onChange={(e) => { setCharge(e.target.value); setValidee(false); }} placeholder="0" />
          </label>
        ) : null}
        <label className="flex-1 text-xs text-text-meta" htmlFor={`${id}-valeur`}>
          {exercice.mesure === "duree" ? "Durée (s)" : "Répétitions"}
          <input id={`${id}-valeur`} inputMode="numeric" className={`${CHAMP} mt-1`} value={valeur} onChange={(e) => { setValeur(e.target.value); setValidee(false); }} />
        </label>
        <Button
          variante={validee ? "secondaire" : "primaire"}
          enCours={enCours}
          onClick={valider}
          aria-label={`Valider la série ${numero} de ${exercice.nom}`}
          className="px-4"
        >
          {validee && !enCours ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
          {validee ? "Corriger" : "Valider"}
        </Button>
      </div>
      {erreur ? (
        <p role="alert" className="mt-1 pl-10 text-sm text-error">
          {erreur}
        </p>
      ) : null}
    </li>
  );
}

function BlocExercice({ seanceId, exercice, onRepos }: { seanceId: string; exercice: ExerciceSeance; onRepos: (secondes: number) => void }) {
  const dejaFaites = Math.max(0, ...exercice.enregistrees.map((s) => s.numero));
  const [nombreSeries, setNombreSeries] = useState(Math.max(exercice.series, dejaFaites));
  const fiche = trouverExercice(exercice.exerciceId);
  return (
    <section aria-label={exercice.nom} className="rounded-card border border-border bg-surface p-5">
      <header>
        <h2 className="font-display text-lg font-bold">
          <Link href={`/programmes/exercices/${exercice.exerciceId}`} className="hover:text-primary hover:underline">
            {exercice.nom}
          </Link>
        </h2>
        <p className="text-sm text-text-secondary">{exercice.prescription}</p>
        {exercice.derniereFois ? <p className="mt-1 text-sm text-text-meta">Dernière fois : {exercice.derniereFois}</p> : null}
        {exercice.suggestion ? <p className="mt-1 text-sm font-medium text-primary">{exercice.suggestion.raison}</p> : null}
      </header>
      {fiche ? (
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <IllustrationExerciceParId exerciceId={exercice.exerciceId} />
          <div className="rounded-xl bg-surface-raised p-4">
            <h3 className="font-semibold">Comment faire</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              {fiche.consignes.map((consigne) => <li key={consigne}>{consigne}</li>)}
            </ol>
            {fiche.precautions.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                <h4 className="text-sm font-semibold">À garder en tête</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                  {fiche.precautions.map((precaution) => <li key={precaution}>{precaution}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <ol className="mt-2 divide-y divide-border">
        {Array.from({ length: nombreSeries }, (_, i) => i + 1).map((numero) => (
          <LigneSerie
            key={numero}
            seanceId={seanceId}
            exercice={exercice}
            numero={numero}
            initiale={exercice.enregistrees.find((s) => s.numero === numero)}
            onValidee={() => onRepos(exercice.reposSec)}
          />
        ))}
      </ol>
      {nombreSeries < 20 ? (
        <Button variante="discret" className="mt-1" onClick={() => setNombreSeries((n) => n + 1)}>
          <Plus aria-hidden="true" className="size-4" />
          Ajouter une série
        </Button>
      ) : null}
    </section>
  );
}

function formaterDuree(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SeanceEnDirect({ seanceId, nom, commenceeLe, exercices }: Props) {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [finRepos, setFinRepos] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmerAnnulation, setConfirmerAnnulation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  useEffect(() => {
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), 500);
    return () => window.clearInterval(minuterie);
  }, []);

  const restant = finRepos === null ? 0 : Math.max(0, Math.ceil((finRepos - maintenant) / 1000));
  const ecoule = Math.max(0, Math.floor((maintenant - Date.parse(commenceeLe)) / 1000));

  useEffect(() => {
    if (finRepos !== null && restant === 0) {
      navigator.vibrate?.(200);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fin du compte à rebours
      setFinRepos(null);
    }
  }, [finRepos, restant]);

  const executer = (action: () => Promise<{ ok: boolean; erreur?: string }>) => {
    setErreur(null);
    startTransition(async () => {
      const reponse = await action();
      if (!reponse.ok) setErreur(reponse.erreur ?? "Une erreur est survenue.");
    });
  };

  return (
    <div className="space-y-4 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Séance en cours</p>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{nom}</h1>
        </div>
        <p className="font-display text-xl font-bold tabular-nums" aria-label={`Durée de la séance : ${formaterDuree(ecoule)}`}>
          {formaterDuree(ecoule)}
        </p>
      </header>

      {exercices.map((exercice) => (
        <BlocExercice
          key={exercice.exerciceId}
          seanceId={seanceId}
          exercice={exercice}
          onRepos={(secondes) => setFinRepos(secondes > 0 ? Date.now() + secondes * 1000 : null)}
        />
      ))}

      <section aria-labelledby="titre-fin" className="rounded-card border border-border bg-surface p-5">
        <h2 id="titre-fin" className="font-display text-lg font-bold">
          Fin de séance
        </h2>
        <label htmlFor="notes-seance" className="mt-3 block text-sm font-medium">
          Notes (facultatif)
        </label>
        <textarea
          id="notes-seance"
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sensations, douleur, matériel indisponible…"
          className="mt-1.5 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-primary"
        />
        {erreur ? <div className="mt-3"><FormMessage type="erreur">{erreur}</FormMessage></div> : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button enCours={enCours && !confirmerAnnulation} disabled={enCours} onClick={() => executer(() => terminerSeance(seanceId, notes))}>
            Terminer la séance
          </Button>
          {confirmerAnnulation ? (
            <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Confirmer l’annulation">
              <span>Annuler la séance ? Les séries saisies ne seront pas comptées.</span>
              <Button variante="secondaire" enCours={enCours} onClick={() => executer(() => annulerSeance(seanceId))}>
                Oui, annuler
              </Button>
              <Button variante="discret" disabled={enCours} onClick={() => setConfirmerAnnulation(false)}>
                Non
              </Button>
            </div>
          ) : (
            <Button variante="discret" disabled={enCours} onClick={() => setConfirmerAnnulation(true)}>
              Annuler la séance
            </Button>
          )}
        </div>
      </section>

      {finRepos !== null ? (
        <div
          role="timer"
          aria-live="polite"
          className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-card border border-primary/30 bg-primary px-5 py-3 text-on-primary shadow-lg lg:bottom-6 lg:left-[calc(16rem+1rem)]"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Timer aria-hidden="true" className="size-5" />
            Repos : <span className="tabular-nums">{formaterDuree(restant)}</span>
          </span>
          <button type="button" onClick={() => setFinRepos(null)} className="min-h-11 rounded-lg px-3 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-white">
            Passer
          </button>
        </div>
      ) : null}
    </div>
  );
}
