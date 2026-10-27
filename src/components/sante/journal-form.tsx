"use client";

import { useState, useTransition } from "react";

import { enregistrerJournal, supprimerJournal } from "@/app/(app)/sante/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import type { ResultatAction } from "@/lib/validation/auth";

type Valeurs = {
  sommeilHeures: string;
  qualiteSommeil: string;
  fatigue: string;
  pas: string;
  douleurZone: string;
  douleurIntensite: string;
  note: string;
};

const ECHELLE = [1, 2, 3, 4, 5];

function Echelle({ nom, legende, valeur, onChange, bas, haut }: { nom: string; legende: string; valeur: string; onChange: (v: string) => void; bas: string; haut: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{legende}</legend>
      <div className="flex gap-2">
        {ECHELLE.map((n) => (
          <label key={n} className="flex-1">
            <input type="radio" name={nom} value={n} checked={valeur === String(n)} onChange={() => onChange(String(n))} className="peer sr-only" />
            <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface-raised font-semibold peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
              {n}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-1 flex justify-between text-xs text-text-meta"><span>{bas}</span><span>{haut}</span></p>
    </fieldset>
  );
}

export function JournalForm({ initial, jour }: { initial: Valeurs; jour: string }) {
  const [v, setV] = useState(initial);
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const maj = (cle: keyof Valeurs) => (valeur: string) => setV((avant) => ({ ...avant, [cle]: valeur }));
  const champs = resultat && !resultat.ok ? resultat.champs ?? {} : {};
  const dejaRempli = Object.values(initial).some((x) => x !== "");

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => setResultat(await enregistrerJournal(v)));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="sommeil" label="Sommeil cette nuit" suffixe="h" inputMode="decimal" value={v.sommeilHeures} onChange={(e) => maj("sommeilHeures")(e.target.value)} error={champs.sommeilHeures} />
        <TextField id="pas" label="Pas aujourd’hui" inputMode="numeric" value={v.pas} onChange={(e) => maj("pas")(e.target.value)} error={champs.pas} hint="Saisie manuelle (podomètre, téléphone…)." />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Echelle nom="qualite" legende="Qualité du sommeil" valeur={v.qualiteSommeil} onChange={maj("qualiteSommeil")} bas="Mauvaise" haut="Excellente" />
        <Echelle nom="fatigue" legende="Niveau de fatigue" valeur={v.fatigue} onChange={maj("fatigue")} bas="En forme" haut="Épuisé" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="douleur-zone" label="Douleur ou inconfort (zone)" placeholder="Ex. : genou droit" value={v.douleurZone} onChange={(e) => maj("douleurZone")(e.target.value)} error={champs.douleurZone} />
        <TextField id="douleur-intensite" label="Intensité de la douleur (0 à 10)" inputMode="numeric" value={v.douleurIntensite} onChange={(e) => maj("douleurIntensite")(e.target.value)} error={champs.douleurIntensite} />
      </div>
      <TextAreaField id="note-sante" label="Note personnelle" value={v.note} onChange={(e) => maj("note")(e.target.value)} error={champs.note} />
      {resultat ? <FormMessage type={resultat.ok ? "succes" : "erreur"}>{resultat.ok ? resultat.message : resultat.erreur}</FormMessage> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" enCours={enCours}>Enregistrer</Button>
        {dejaRempli ? (
          <Button variante="discret" disabled={enCours} onClick={() => startTransition(async () => {
            const reponse = await supprimerJournal(jour);
            setResultat(reponse);
            if (reponse.ok) setV({ sommeilHeures: "", qualiteSommeil: "", fatigue: "", pas: "", douleurZone: "", douleurIntensite: "", note: "" });
          })}>
            Effacer l’entrée du jour
          </Button>
        ) : null}
      </div>
    </form>
  );
}
