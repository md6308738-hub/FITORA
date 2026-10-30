"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { changerJourSeance, remplacerExercice } from "@/app/(app)/programmes/actions";
import { CarteMuscles, IllustrationExercice } from "@/components/exercices/illustration-exercice";
import { alternatives, trouverExercice } from "@/lib/exercices/catalogue";
import type { SeanceComplete } from "@/lib/data/programmes";

import { formaterPrescription, nomJour } from "./format";

const SELECT =
  "min-h-11 rounded-xl border border-border bg-surface-raised px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60";

/** Séance type d'un programme ; modifiable (jour, exercices) si le programme est actif. */
export function SeanceType({ seance, modifiable }: { seance: SeanceComplete; modifiable: boolean }) {
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  const executer = (action: () => Promise<{ ok: boolean; erreur?: string }>) => {
    setErreur(null);
    startTransition(async () => {
      const reponse = await action();
      if (!reponse.ok) setErreur(reponse.erreur ?? "Une erreur est survenue.");
    });
  };

  return (
    <article className="rounded-card border border-border bg-surface p-5" aria-busy={enCours || undefined}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{seance.nom}</h3>
        {modifiable ? (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Jour
            <select
              className={SELECT}
              value={seance.jour_semaine}
              disabled={enCours}
              onChange={(e) => executer(() => changerJourSeance(seance.id, Number(e.target.value)))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((jour) => (
                <option key={jour} value={jour}>
                  {nomJour(jour)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
            {nomJour(seance.jour_semaine)}
          </span>
        )}
      </header>
      {erreur ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {erreur}
        </p>
      ) : null}
      <ol className="mt-4 space-y-2">
        {seance.exercices.map((ligne) => {
          const exercice = trouverExercice(ligne.exercice_id);
          const options = exercice ? alternatives(exercice).filter((a) => a.mesure === exercice.mesure) : [];
          return (
            <li key={ligne.id} className="rounded-xl border border-border bg-surface p-2.5">
              <div className="grid grid-cols-[minmax(5.5rem,0.42fr)_minmax(0,1fr)_2.5rem] items-center gap-2.5 sm:grid-cols-[minmax(7rem,0.55fr)_minmax(0,1fr)_2.75rem] sm:gap-3">
                {exercice ? (
                  <Link href={`/programmes/exercices/${ligne.exercice_id}`} aria-label={`Voir le schéma de ${exercice.nom}`} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
                    <IllustrationExercice exercice={exercice} compact />
                  </Link>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-lg bg-surface-raised text-xs text-text-meta">Visuel indisponible</div>
                )}
                <div className="min-w-0 py-1">
                  <Link
                    href={`/programmes/exercices/${ligne.exercice_id}`}
                    className="font-semibold leading-tight text-text hover:text-primary hover:underline"
                  >
                    {exercice?.nom ?? ligne.exercice_id}
                  </Link>
                  <p className="mt-1 text-xs text-text-meta">{formaterPrescription(ligne)}</p>
                  <Link href={`/programmes/exercices/${ligne.exercice_id}`} className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    Voir les consignes <span aria-hidden="true">→</span>
                  </Link>
                  {modifiable && options.length > 0 ? (
                    <label className="block">
                      <span className="sr-only">Remplacer {exercice?.nom}</span>
                      <select
                        id={`remplacer-${ligne.id}`}
                        className={`${SELECT} mt-1 w-full text-xs sm:max-w-56`}
                        value=""
                        disabled={enCours}
                        onChange={(e) => e.target.value && executer(() => remplacerExercice(ligne.id, e.target.value))}
                      >
                        <option value="">Remplacer l’exercice…</option>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.nom}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
                {exercice ? <CarteMuscles exercice={exercice} compact /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
