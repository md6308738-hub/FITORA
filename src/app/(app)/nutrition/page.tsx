import Image from "next/image";
import { ArrowRight, Droplets, Leaf, Target, TriangleAlert, Utensils } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { HydrationControls } from "@/components/dashboard/hydration-controls";
import { AjoutRepas, BoutonsPlan, BoutonSupprimerRepas, PlanSemaine } from "@/components/nutrition/nutrition-client";
import { MOMENTS } from "@/lib/nutrition/libelles";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { objectifHydratationMl, totalParJour } from "@/lib/calculs/hydratation";
import { estimerBesoins } from "@/lib/calculs/nutrition";
import { jourLocal, jourSemaine } from "@/lib/dates";
import { getPrisesEauDepuis } from "@/lib/data/hydratation";
import { getDernierPlan, getRepasDuJour } from "@/lib/data/nutrition";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet } from "@/lib/data/session";
import { apports, somme, trouverAliment } from "@/lib/nutrition/aliments";

export const metadata: Metadata = { title: "Nutrition" };

export default function NutritionPage() {
  return (
    <div className="space-y-5">
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement de la nutrition" className="h-96 animate-pulse rounded-card bg-surface" />}>
        <ContenuNutrition />
      </Suspense>
    </div>
  );
}

function BanniereNutrition() {
  return (
    <section className="relative isolate flex min-h-64 overflow-hidden rounded-card bg-primary text-white sm:min-h-72" aria-labelledby="titre-nutrition">
      <Image
        src="/images/nutrition-jollof.jpg"
        alt="Plat équilibré composé de riz et de légumes"
        fill
        priority
        sizes="(min-width: 1280px) 1024px, 100vw"
        className="-z-20 object-cover object-[62%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-text/70" />
      <div className="flex w-full flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-semibold tracking-[0.24em] text-white/80 uppercase">Nutrition FITORA</p>
        <h1 id="titre-nutrition" className="mt-3 max-w-2xl font-display text-3xl leading-[0.98] font-extrabold tracking-tight uppercase sm:text-4xl lg:text-5xl">
          Bien manger <span className="text-accent-clair">à ton rythme</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-white/90 sm:text-base">
          Suis ce que tu consommes, découvre tes repères estimés et organise tes repas de la semaine.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/90 sm:text-sm">
          <li className="inline-flex items-center gap-2"><Utensils aria-hidden="true" className="size-4 text-accent-clair" /> Journal alimentaire</li>
          <li className="inline-flex items-center gap-2"><Target aria-hidden="true" className="size-4 text-accent-clair" /> Repères personnalisés</li>
          <li className="inline-flex items-center gap-2"><Leaf aria-hidden="true" className="size-4 text-accent-clair" /> Aliments du quotidien</li>
        </ul>
        <nav aria-label="Accès rapide en nutrition" className="mt-6 flex flex-wrap gap-2">
          <Link href="#journal" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover">
            Ajouter un aliment <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="#plan" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20">
            Voir mon plan <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </nav>
      </div>
    </section>
  );
}

function AnneauCalories({ valeur, cible }: { valeur: number; cible: number | null }) {
  const rayon = 48;
  const circonference = 2 * Math.PI * rayon;
  const progression = cible ? Math.min(1, valeur / cible) : 0;
  const valeurAffichee = Math.round(valeur).toLocaleString("fr-FR");
  const cibleAffichee = cible ? Math.round(cible).toLocaleString("fr-FR") : null;

  return (
    <div
      role="img"
      aria-label={cible ? `${valeurAffichee} kilocalories estimées sur ${cibleAffichee} kilocalories cibles estimées` : `${valeurAffichee} kilocalories estimées, cible indisponible`}
      className="relative size-36 shrink-0"
    >
      <svg aria-hidden="true" viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={rayon} fill="none" className="stroke-border" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={rayon}
          fill="none"
          className="stroke-primary"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={circonference * (1 - progression)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <strong className="font-display text-2xl leading-tight">{valeurAffichee}</strong>
        <span className="text-xs text-text-secondary">kcal estimées</span>
        <span className="mt-1 text-[11px] text-text-meta">{cibleAffichee ? `sur ${cibleAffichee} kcal` : "cible indisponible"}</span>
      </div>
    </div>
  );
}

function ResumeApports({
  consomme,
  besoins,
}: {
  consomme: ReturnType<typeof somme>;
  besoins: ReturnType<typeof estimerBesoins> | null;
}) {
  const macronutriments = [
    { nom: "Protéines", valeur: consomme.proteines, cible: besoins?.proteinesG ?? null },
    { nom: "Glucides", valeur: consomme.glucides, cible: besoins?.glucidesG ?? null },
    { nom: "Lipides", valeur: consomme.lipides, cible: besoins?.lipidesG ?? null },
  ];

  return (
    <Card id="apports" aria-labelledby="titre-apports" className="scroll-mt-6">
      <div className="flex items-center justify-between gap-3">
        <CardTitle id="titre-apports">Mes apports du jour</CardTitle>
        <Link href="#journal" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Détails <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-between">
        <AnneauCalories valeur={consomme.kcal} cible={besoins?.apportCibleKcal ?? null} />
        <div className="grid min-w-40 flex-1 gap-3">
          {macronutriments.map((macro) => (
            <div key={macro.nom}>
              <div className="mb-1 flex justify-between gap-2 text-xs">
                <span className="font-medium">{macro.nom}</span>
                <span className="text-text-secondary">
                  {Math.round(macro.valeur)}{macro.cible ? ` / ${macro.cible} g` : " g"}
                </span>
              </div>
              {macro.cible ? <ProgressBar valeur={(macro.valeur / macro.cible) * 100} label={`${macro.nom} estimés consommés`} /> : null}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-xs text-text-meta">
        Les apports proviennent des aliments enregistrés et leurs valeurs restent indicatives.
        {besoins ? " Les objectifs sont des estimations, pas des prescriptions." : " Complète ton profil et enregistre une pesée pour afficher des objectifs estimés."}
      </p>
    </Card>
  );
}

function SuiviHydratation({
  consommeMl,
  objectifMl,
  peutAnnuler,
}: {
  consommeMl: number;
  objectifMl: number | null;
  peutAnnuler: boolean;
}) {
  const progression = objectifMl ? Math.min(100, (consommeMl / objectifMl) * 100) : 0;

  return (
    <Card aria-labelledby="titre-hydratation">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Droplets aria-hidden="true" className="size-5" />
        </span>
        <div>
          <CardTitle id="titre-hydratation">Hydratation</CardTitle>
          <p className="mt-1 text-sm font-semibold">
            {consommeMl.toLocaleString("fr-FR")} ml{objectifMl ? ` sur ${objectifMl.toLocaleString("fr-FR")} ml` : " enregistrés"}
          </p>
        </div>
      </div>
      {objectifMl ? (
        <div className="mt-4">
          <ProgressBar valeur={progression} label="Progression de l’hydratation" />
          <p className="mt-1 text-right text-xs text-text-meta">{Math.round(progression)} % du repère estimé</p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-text-meta">Enregistre une pesée pour afficher un repère quotidien indicatif.</p>
      )}
      <div className="mt-4 border-t border-border pt-4">
        <HydrationControls peutAnnuler={peutAnnuler} />
      </div>
    </Card>
  );
}

async function ContenuNutrition() {
  const profil = await exigerProfilComplet();
  const aujourdhui = jourLocal();
  const [pesees, repas, dernierPlan, prisesEau] = await Promise.all([
    getPesees(),
    getRepasDuJour(aujourdhui),
    getDernierPlan(),
    getPrisesEauDepuis(aujourdhui),
  ]);
  const prisesAujourdhui = prisesEau.filter((prise) => prise.jour === aujourdhui);
  const eauAujourdhui = totalParJour(prisesAujourdhui).get(aujourdhui) ?? 0;
  const poids = pesees.at(-1)?.poids_kg;
  const objectifEau = poids ? objectifHydratationMl(poids) : null;
  const besoins =
    poids && profil.taille_cm && profil.age && profil.niveau_activite && profil.objectif
      ? estimerBesoins({ poidsKg: poids, tailleCm: profil.taille_cm, age: profil.age, sexe: profil.sexe, niveauActivite: profil.niveau_activite, objectif: profil.objectif })
      : null;

  const consomme = somme(repas.flatMap((r) => {
    const aliment = trouverAliment(r.aliment_id);
    return aliment ? [apports(aliment, r.quantite_g)] : [];
  }));

  return (
    <div className="space-y-5">
      <BanniereNutrition />

      <nav aria-label="Sections nutrition" className="flex flex-wrap gap-2">
        <Link href="#journal" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary">Journal du jour</Link>
        <Link href="#apports" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Apports estimés</Link>
        <Link href="#plan" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:border-primary">Plan de la semaine</Link>
      </nav>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)]">
        <Card id="journal" aria-labelledby="titre-journal" className="scroll-mt-6">
          <div>
            <p className="text-sm font-semibold text-primary">Aujourd’hui</p>
            <h2 id="titre-journal" className="mt-1 font-display text-xl font-bold">Journal alimentaire</h2>
          </div>
          <div className="mt-5">
            <h3 className="mb-3 font-semibold">Ajouter un aliment</h3>
            <AjoutRepas />
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="font-semibold">Repas enregistrés</h3>
            <div className="mt-3 space-y-4">
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
          </div>
        </Card>

        <aside className="space-y-4" aria-label="Résumé nutritionnel">
          <ResumeApports consomme={consomme} besoins={besoins} />
          <SuiviHydratation consommeMl={eauAujourdhui} objectifMl={objectifEau} peutAnnuler={prisesAujourdhui.length > 0} />
        </aside>
      </div>

      <Card id="plan" aria-labelledby="titre-plan" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Tes repas organisés</p>
            <h2 id="titre-plan" className="mt-1 font-display text-xl font-bold">Plan de la semaine</h2>
          </div>
          {dernierPlan ? <p className="text-sm text-text-meta">Objectif du plan : {dernierPlan.kcalCible.toLocaleString("fr-FR")} kcal estimées / jour</p> : null}
        </div>
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
          {dernierPlan ? (
            <PlanSemaine plan={dernierPlan.plan} jourActuel={jourSemaine()} />
          ) : (
            <p className="rounded-xl bg-surface-raised p-4 text-sm text-text-secondary">
              Aucun plan enregistré pour le moment. Tu peux en générer un à partir de tes données et préférences.
            </p>
          )}
        </div>
        <div className="mt-5">
          <BoutonsPlan existe={Boolean(dernierPlan)} />
        </div>
      </Card>
    </div>
  );
}
