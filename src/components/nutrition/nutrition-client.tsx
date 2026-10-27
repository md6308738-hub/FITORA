"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { ajouterRepas, genererPlanRepas, supprimerRepas } from "@/app/(app)/nutrition/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { ALIMENTS, apports, trouverAliment, type Categorie } from "@/lib/nutrition/aliments";
import { apportsElements, listeDeCourses, type Plan } from "@/lib/nutrition/plan";
import type { MomentRepas } from "@/types/database";

export const MOMENTS: { valeur: MomentRepas; libelle: string }[] = [
  { valeur: "petit_dejeuner", libelle: "Petit-déjeuner" },
  { valeur: "dejeuner", libelle: "Déjeuner" },
  { valeur: "diner", libelle: "Dîner" },
  { valeur: "collation", libelle: "Collation" },
];

export const CATEGORIES: Record<Categorie, string> = {
  feculent: "Féculents",
  petit_dejeuner: "Petit-déjeuner",
  legumineuse: "Légumineuses et arachide",
  proteine: "Viandes, poissons, œufs",
  laitier: "Produits laitiers",
  legume: "Légumes",
  fruit: "Fruits",
  matiere_grasse: "Matières grasses",
};

const CHAMP = "min-h-11 w-full rounded-xl border border-border bg-surface-raised px-3 text-base focus-visible:outline-2 focus-visible:outline-primary";
const kcal = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} kcal`;
const quantite = (g: number) => (g >= 1000 ? `${(g / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg` : `${g} g`);

export function AjoutRepas() {
  const [moment, setMoment] = useState<MomentRepas>("dejeuner");
  const [alimentId, setAlimentId] = useState("");
  const [grammes, setGrammes] = useState("");
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const aliment = trouverAliment(alimentId);

  return (
    <form
      noValidate
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setErreur(null);
        startTransition(async () => {
          const reponse = await ajouterRepas({ moment, alimentId, quantiteG: grammes });
          if (reponse.ok) {
            setAlimentId("");
            setGrammes("");
          } else setErreur(Object.values(reponse.champs ?? {})[0] ?? reponse.erreur);
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_1fr]">
        <label className="text-sm font-medium">
          Repas
          <select className={`${CHAMP} mt-1.5`} value={moment} onChange={(e) => setMoment(e.target.value as MomentRepas)}>
            {MOMENTS.map((m) => <option key={m.valeur} value={m.valeur}>{m.libelle}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Aliment
          <select
            className={`${CHAMP} mt-1.5`}
            value={alimentId}
            onChange={(e) => {
              setAlimentId(e.target.value);
              const choisi = trouverAliment(e.target.value);
              if (choisi && !grammes) setGrammes(String(choisi.portion.grammes));
            }}
          >
            <option value="">Choisir…</option>
            {(Object.keys(CATEGORIES) as Categorie[]).map((c) => (
              <optgroup key={c} label={CATEGORIES[c]}>
                {ALIMENTS.filter((a) => a.categorie === c).map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Quantité (g)
          <input className={`${CHAMP} mt-1.5`} inputMode="decimal" value={grammes} onChange={(e) => setGrammes(e.target.value)} />
        </label>
      </div>
      {aliment ? (
        <p className="text-sm text-text-meta">
          Portion de référence : {aliment.portion.libelle} ≈ {aliment.portion.grammes} g
          {Number(grammes) > 0 ? ` · ${kcal(apports(aliment, Number(grammes)).kcal)} estimées` : ""}
        </p>
      ) : null}
      {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
      <Button type="submit" enCours={enCours}>Ajouter au journal</Button>
    </form>
  );
}

export function BoutonSupprimerRepas({ id, nom }: { id: number; nom: string }) {
  const [enCours, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label={`Supprimer ${nom}`}
      disabled={enCours}
      onClick={() => startTransition(async () => void (await supprimerRepas(id)))}
      className="flex size-11 items-center justify-center rounded-lg text-text-meta hover:bg-surface-raised hover:text-error focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
    >
      <Trash2 aria-hidden="true" className="size-4" />
    </button>
  );
}

export function BoutonsPlan({ existe }: { existe: boolean }) {
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const lancer = (nouvelle: boolean) =>
    startTransition(async () => {
      setErreur(null);
      const reponse = await genererPlanRepas(nouvelle);
      if (!reponse.ok) setErreur(reponse.erreur);
    });
  return (
    <div className="space-y-3">
      <Button enCours={enCours} variante={existe ? "secondaire" : "primaire"} onClick={() => lancer(existe)}>
        {existe ? "Proposer un autre plan" : "Générer mon plan de la semaine"}
      </Button>
      {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
    </div>
  );
}

const NOMS_JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function PlanSemaine({ plan, jourActuel }: { plan: Plan; jourActuel: number }) {
  const [jour, setJour] = useState(jourActuel);
  const [courses, setCourses] = useState(false);
  const journee = plan.jours.find((j) => j.jour === jour) ?? plan.jours[0];
  const total = apportsElements(journee?.repas.flatMap((r) => r.elements) ?? []);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Jour du plan" className="flex flex-wrap gap-1">
        {NOMS_JOURS.map((nom, i) => (
          <button
            key={nom}
            role="tab"
            type="button"
            aria-selected={jour === i + 1}
            onClick={() => { setJour(i + 1); setCourses(false); }}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium ${jour === i + 1 && !courses ? "bg-primary text-on-primary" : "bg-surface-raised text-text-secondary hover:text-text"}`}
          >
            {nom}
          </button>
        ))}
        <button
          role="tab"
          type="button"
          aria-selected={courses}
          onClick={() => setCourses(true)}
          className={`min-h-11 rounded-lg px-3 text-sm font-medium ${courses ? "bg-primary text-on-primary" : "bg-surface-raised text-text-secondary hover:text-text"}`}
        >
          Liste de courses
        </button>
      </div>

      {courses ? (
        <div role="tabpanel" className="grid gap-4 sm:grid-cols-2">
          {listeDeCourses(plan).map((groupe) => (
            <div key={groupe.categorie}>
              <h3 className="text-sm font-semibold">{CATEGORIES[groupe.categorie]}</h3>
              <ul className="mt-1 divide-y divide-border text-sm">
                {groupe.articles.map((a) => (
                  <li key={a.alimentId} className="flex justify-between gap-3 py-1.5">
                    <span>{a.nom}</span>
                    <span className="text-text-secondary">{quantite(a.grammes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-text-meta sm:col-span-2">Quantités cuites ou prêtes à consommer, cumulées sur 7 jours. Les prix ne sont pas estimés.</p>
        </div>
      ) : (
        <div role="tabpanel" className="space-y-4">
          {journee?.repas.map((repas) => (
            <div key={repas.moment}>
              <h3 className="flex justify-between text-sm font-semibold">
                <span>{MOMENTS.find((m) => m.valeur === repas.moment)?.libelle}</span>
                <span className="font-normal text-text-meta">{kcal(apportsElements(repas.elements).kcal)}</span>
              </h3>
              <ul className="mt-1 text-sm text-text-secondary">
                {repas.elements.map((e) => (
                  <li key={e.alimentId} className="flex justify-between gap-3 py-0.5">
                    <span>{trouverAliment(e.alimentId)?.nom}</span>
                    <span>{quantite(e.grammes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="border-t border-border pt-3 text-sm">
            Total estimé : <strong>{kcal(total.kcal)}</strong> · protéines {Math.round(total.proteines)} g · glucides {Math.round(total.glucides)} g · lipides {Math.round(total.lipides)} g
          </p>
        </div>
      )}
    </div>
  );
}
