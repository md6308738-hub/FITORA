"use client";

import { useState, useTransition } from "react";

import { changerStatutObjectif, creerObjectif, enregistrerMensuration, supprimerObjectif } from "@/app/(app)/progression/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formaterDateCourte } from "@/lib/dates";
import type { ResultatAction } from "@/lib/validation/auth";
import type { TypeMensuration, TypeObjectif } from "@/types/database";

import { GraphiqueEvolution } from "./graphiques";

export const MENSURATIONS: { valeur: TypeMensuration; libelle: string; unite: string }[] = [
  { valeur: "tour_de_taille", libelle: "Tour de taille", unite: "cm" },
  { valeur: "hanches", libelle: "Hanches", unite: "cm" },
  { valeur: "poitrine", libelle: "Poitrine", unite: "cm" },
  { valeur: "bras", libelle: "Bras", unite: "cm" },
  { valeur: "cuisse", libelle: "Cuisse", unite: "cm" },
  { valeur: "masse_grasse", libelle: "Masse grasse", unite: "%" },
];

export const OBJECTIFS: { valeur: TypeObjectif; libelle: string; unite: string }[] = [
  { valeur: "poids", libelle: "Poids", unite: "kg" },
  { valeur: "seances_semaine", libelle: "Séances par semaine", unite: "séances" },
  { valeur: "hydratation", libelle: "Eau par jour", unite: "ml" },
  { valeur: "pas", libelle: "Pas par jour", unite: "pas" },
];

const CHAMP = "min-h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-base focus-visible:outline-2 focus-visible:outline-primary";

function useAction() {
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const executer = (action: () => Promise<ResultatAction>, apres?: () => void) =>
    startTransition(async () => {
      const reponse = await action();
      setResultat(reponse);
      if (reponse.ok) apres?.();
    });
  return { enCours, resultat, executer };
}

function Retour({ resultat }: { resultat: ResultatAction | null }) {
  if (!resultat) return null;
  if (!resultat.ok) {
    const detail = Object.values(resultat.champs ?? {})[0];
    return <FormMessage type="erreur">{detail ?? resultat.erreur}</FormMessage>;
  }
  return resultat.message ? <FormMessage type="succes">{resultat.message}</FormMessage> : null;
}

/** Saisie d'une mensuration du jour et graphique de son évolution. */
export function Mensurations({ points, aujourdhui }: { points: { type: TypeMensuration; jour: string; valeur: number }[]; aujourdhui: string }) {
  const [type, setType] = useState<TypeMensuration>("tour_de_taille");
  const [valeur, setValeur] = useState("");
  const { enCours, resultat, executer } = useAction();
  const info = MENSURATIONS.find((m) => m.valeur === type) ?? MENSURATIONS[0];

  return (
    <div className="space-y-5">
      <form
        noValidate
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          executer(() => enregistrerMensuration({ type, valeur }), () => setValeur(""));
        }}
      >
        <label className="text-sm font-medium">
          Mesure
          <select className={`${CHAMP} mt-1.5`} value={type} onChange={(e) => setType(e.target.value as TypeMensuration)}>
            {MENSURATIONS.map((m) => <option key={m.valeur} value={m.valeur}>{m.libelle}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Valeur du jour ({info?.unite})
          <input className={`${CHAMP} mt-1.5`} inputMode="decimal" value={valeur} onChange={(e) => setValeur(e.target.value)} />
        </label>
        <Button type="submit" enCours={enCours}>Enregistrer</Button>
      </form>
      <Retour resultat={resultat} />
      <GraphiqueEvolution
        titre={info?.libelle ?? ""}
        unite={info?.unite ?? ""}
        aujourdhui={aujourdhui}
        points={points.filter((p) => p.type === type).map((p) => ({ jour: p.jour, valeur: p.valeur }))}
      />
    </div>
  );
}

export function NouvelObjectif() {
  const [type, setType] = useState<TypeObjectif>("seances_semaine");
  const [cible, setCible] = useState("");
  const [echeance, setEcheance] = useState("");
  const { enCours, resultat, executer } = useAction();
  const info = OBJECTIFS.find((o) => o.valeur === type);
  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        executer(() => creerObjectif({ type, cible, echeance }), () => { setCible(""); setEcheance(""); });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium">
          Objectif
          <select className={`${CHAMP} mt-1.5`} value={type} onChange={(e) => setType(e.target.value as TypeObjectif)}>
            {OBJECTIFS.map((o) => <option key={o.valeur} value={o.valeur}>{o.libelle}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Cible ({info?.unite})
          <input className={`${CHAMP} mt-1.5`} inputMode="decimal" value={cible} onChange={(e) => setCible(e.target.value)} />
        </label>
        <label className="text-sm font-medium">
          Échéance (facultatif)
          <input type="date" className={`${CHAMP} mt-1.5`} value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </label>
      </div>
      <Retour resultat={resultat} />
      <Button type="submit" enCours={enCours}>Ajouter l’objectif</Button>
    </form>
  );
}

export type ObjectifAffiche = {
  id: string;
  type: TypeObjectif;
  cible: number;
  echeance: string | null;
  statut: "en_cours" | "atteint" | "abandonne";
  avancement: number | null;
};

export function ListeObjectifs({ objectifs }: { objectifs: ObjectifAffiche[] }) {
  const { enCours, resultat, executer } = useAction();
  if (objectifs.length === 0) return <p className="text-text-secondary">Aucun objectif pour le moment.</p>;
  return (
    <div className="space-y-3">
      {resultat && !resultat.ok ? <Retour resultat={resultat} /> : null}
      <ul className="divide-y divide-border">
        {objectifs.map((o) => {
          const info = OBJECTIFS.find((x) => x.valeur === o.type);
          return (
            <li key={o.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {info?.libelle} : {o.cible.toLocaleString("fr-FR")} {info?.unite}
                  {o.statut !== "en_cours" ? (
                    <span className="ml-2 rounded-full bg-surface-raised px-2 py-0.5 text-xs text-text-secondary">{o.statut === "atteint" ? "Atteint" : "Abandonné"}</span>
                  ) : null}
                </p>
                {o.echeance ? <p className="text-sm text-text-meta">Échéance : {formaterDateCourte(o.echeance)}</p> : null}
              </div>
              {o.statut === "en_cours" ? (
                o.avancement === null ? (
                  <p className="mt-2 text-sm text-text-meta">Pas encore de donnée enregistrée pour mesurer l’avancement.</p>
                ) : (
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar valeur={o.avancement} label={`Avancement : ${info?.libelle}`} />
                    <span className="w-12 shrink-0 text-right text-sm font-semibold text-primary">{o.avancement} %</span>
                  </div>
                )
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1">
                {o.statut === "en_cours" ? (
                  <>
                    <Button variante="discret" disabled={enCours} onClick={() => executer(() => changerStatutObjectif(o.id, "atteint"))}>Marquer comme atteint</Button>
                    <Button variante="discret" disabled={enCours} onClick={() => executer(() => changerStatutObjectif(o.id, "abandonne"))}>Abandonner</Button>
                  </>
                ) : (
                  <Button variante="discret" disabled={enCours} onClick={() => executer(() => changerStatutObjectif(o.id, "en_cours"))}>Reprendre</Button>
                )}
                <Button variante="discret" disabled={enCours} onClick={() => executer(() => supprimerObjectif(o.id))}>Supprimer</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
