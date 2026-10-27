import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { AjoutRepas, BoutonsPlan, BoutonSupprimerRepas, PlanSemaine } from "@/components/nutrition/nutrition-client";
import { MOMENTS } from "@/lib/nutrition/libelles";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { estimerBesoins } from "@/lib/calculs/nutrition";
import { jourLocal, jourSemaine } from "@/lib/dates";
import { getDernierPlan, getRepasDuJour } from "@/lib/data/nutrition";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet } from "@/lib/data/session";
import { apports, somme, trouverAliment } from "@/lib/nutrition/aliments";

export const metadata: Metadata = { title: "Nutrition" };

export default function NutritionPage() {
  return (
    <>
      <PageHeader title="Nutrition" description="Tes besoins estimés, ton journal du jour et ton plan de repas." />
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement de la nutrition" className="h-96 animate-pulse rounded-card bg-surface" />}>
        <ContenuNutrition />
      </Suspense>
    </>
  );
}

async function ContenuNutrition() {
  const profil = await exigerProfilComplet();
  const aujourdhui = jourLocal();
  const [pesees, repas, dernierPlan] = await Promise.all([getPesees(), getRepasDuJour(aujourdhui), getDernierPlan()]);
  const poids = pesees.at(-1)?.poids_kg;
  const besoins =
    poids && profil.taille_cm && profil.age && profil.niveau_activite && profil.objectif
      ? estimerBesoins({ poidsKg: poids, tailleCm: profil.taille_cm, age: profil.age, sexe: profil.sexe, niveauActivite: profil.niveau_activite, objectif: profil.objectif })
      : null;

  const consomme = somme(repas.flatMap((r) => {
    const aliment = trouverAliment(r.aliment_id);
    return aliment ? [apports(aliment, r.quantite_g)] : [];
  }));

  const barres = besoins
    ? [
        { nom: "Calories", valeur: consomme.kcal, cible: besoins.apportCibleKcal, unite: "kcal" },
        { nom: "Protéines", valeur: consomme.proteines, cible: besoins.proteinesG, unite: "g" },
        { nom: "Glucides", valeur: consomme.glucides, cible: besoins.glucidesG, unite: "g" },
        { nom: "Lipides", valeur: consomme.lipides, cible: besoins.lipidesG, unite: "g" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card aria-labelledby="titre-journal">
        <CardTitle id="titre-journal">Aujourd’hui</CardTitle>
        {besoins ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {barres.map((b) => (
              <div key={b.nom}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{b.nom}</span>
                  <span className="text-text-secondary">{Math.round(b.valeur).toLocaleString("fr-FR")} / {b.cible.toLocaleString("fr-FR")} {b.unite}</span>
                </div>
                <ProgressBar valeur={(b.valeur / b.cible) * 100} label={`${b.nom} consommés`} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-text-secondary">Il manque des informations (poids, taille, âge, activité) pour estimer tes besoins.</p>
        )}
        <p className="mt-3 text-xs text-text-meta">
          Besoins et apports sont des <strong>estimations</strong> (formule de Mifflin-St Jeor, valeurs nutritionnelles de référence arrondies). Ce n’est pas un avis médical.
        </p>

        <div className="mt-6 border-t border-border pt-5">
          <h3 className="mb-3 font-semibold">Ajouter un aliment</h3>
          <AjoutRepas />
        </div>

        <div className="mt-6 space-y-4">
          {repas.length === 0 ? (
            <p className="text-sm text-text-secondary">Aucun repas enregistré aujourd’hui.</p>
          ) : (
            MOMENTS.map((m) => {
              const entrees = repas.filter((r) => r.moment === m.valeur);
              if (entrees.length === 0) return null;
              return (
                <div key={m.valeur}>
                  <h4 className="text-sm font-semibold">{m.libelle}</h4>
                  <ul className="mt-1 divide-y divide-border">
                    {entrees.map((r) => {
                      const aliment = trouverAliment(r.aliment_id);
                      return (
                        <li key={r.id} className="flex items-center justify-between gap-3 py-1 text-sm">
                          <span>{aliment?.nom ?? r.aliment_id} · {r.quantite_g} g</span>
                          <span className="flex items-center gap-1 text-text-secondary">
                            {aliment ? `${Math.round(apports(aliment, r.quantite_g).kcal)} kcal` : null}
                            <BoutonSupprimerRepas id={r.id} nom={aliment?.nom ?? r.aliment_id} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card aria-labelledby="titre-plan">
        <CardTitle id="titre-plan">Plan de repas de la semaine</CardTitle>
        <p className="mt-2 text-sm text-text-secondary">
          Composé avec des aliments courants au Sénégal, selon tes besoins estimés, tes restrictions, tes allergies et ton budget.
        </p>
        {dernierPlan?.plan.avertissements.map((texte) => (
          <p key={texte} className="mt-3 flex gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
            {texte}
          </p>
        ))}
        <div className="mt-4">
          {dernierPlan ? <PlanSemaine plan={dernierPlan.plan} jourActuel={jourSemaine()} /> : null}
        </div>
        <div className="mt-5">
          <BoutonsPlan existe={Boolean(dernierPlan)} />
        </div>
      </Card>
    </div>
  );
}
