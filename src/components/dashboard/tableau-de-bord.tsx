import { ChartLine, Dumbbell, Moon, Target, Timer } from "lucide-react";
import Link from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { objectifHydratationMl, totalParJour } from "@/lib/calculs/hydratation";
import { estimerBesoins } from "@/lib/calculs/nutrition";
import { NOMS_JOURS, seanceDuJour } from "@/lib/calculs/planning";
import { progressionPoids } from "@/lib/calculs/progression";
import { calculerStatistiques } from "@/lib/calculs/statistiques";
import { decalerJour, formaterDateCourte, jourLocal, jourSemaine } from "@/lib/dates";
import { getPrisesEauDepuis } from "@/lib/data/hydratation";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet } from "@/lib/data/session";
import {
  OPTIONS_ACTIVITE,
  OPTIONS_MATERIEL,
  OPTIONS_OBJECTIF,
  libelle,
} from "@/lib/onboarding/options";

import { HydrationControls } from "./hydration-controls";
import { WeighInForm } from "./weigh-in-form";

const kg = (valeur: number) =>
  `${valeur.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg`;
const signe = (valeur: number) => (valeur > 0 ? `+${kg(valeur)}` : kg(valeur));
const litres = (ml: number) =>
  `${(ml / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} L`;

/** Accueil personnalisé : toutes les valeurs viennent des données enregistrées. */
export async function TableauDeBord() {
  const profil = await exigerProfilComplet();
  const aujourdhui = jourLocal();
  const [pesees, prises] = await Promise.all([
    getPesees(),
    getPrisesEauDepuis(decalerJour(aujourdhui, -6)),
  ]);

  const premiere = pesees[0];
  const derniere = pesees.at(-1);
  const debutSuivi = premiere?.mesure_le ?? jourLocal(new Date(profil.cree_le));
  const stats = calculerStatistiques(pesees, prises, debutSuivi, aujourdhui);

  const progression =
    premiere && derniere
      ? progressionPoids(premiere.poids_kg, derniere.poids_kg, profil.poids_objectif_kg, profil.objectif)
      : null;

  const besoins =
    derniere && profil.taille_cm && profil.age && profil.niveau_activite && profil.objectif
      ? estimerBesoins({
          poidsKg: derniere.poids_kg,
          tailleCm: profil.taille_cm,
          age: profil.age,
          sexe: profil.sexe,
          niveauActivite: profil.niveau_activite,
          objectif: profil.objectif,
        })
      : null;

  const seance = profil.jours_par_semaine
    ? seanceDuJour(profil.jours_par_semaine, profil.activites, jourSemaine())
    : null;

  const eauAujourdhui = totalParJour(prises).get(aujourdhui) ?? 0;
  const objectifEau = derniere ? objectifHydratationMl(derniere.poids_kg) : null;

  return (
    <div className="space-y-6">
      <header className="animate-apparition">
        <p className="text-sm font-medium text-text-meta first-letter:uppercase">
          {new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "Africa/Dakar",
          }).format(new Date())}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">
          Bonjour, {profil.prenom}
        </h1>
        {profil.objectif ? (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
            <Target aria-hidden="true" className="size-4" />
            Objectif : {libelle(OPTIONS_OBJECTIF, profil.objectif)}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Poids et progression */}
        <Card className="lg:col-span-2" aria-labelledby="titre-poids">
          <CardTitle id="titre-poids">Poids et progression</CardTitle>
          {derniere ? (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-text-meta">Poids actuel</dt>
                  <dd className="mt-1 font-display text-3xl font-bold">{kg(derniere.poids_kg)}</dd>
                  <dd className="text-xs text-text-meta">le {formaterDateCourte(derniere.mesure_le)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-text-meta">Poids cible</dt>
                  <dd className="mt-1 font-display text-3xl font-bold">
                    {profil.poids_objectif_kg ? kg(profil.poids_objectif_kg) : "—"}
                  </dd>
                  {profil.poids_objectif_kg ? null : (
                    <dd className="text-xs text-text-meta">Non renseigné</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm text-text-meta">Depuis le début</dt>
                  <dd className="mt-1 font-display text-3xl font-bold">
                    {progression && pesees.length > 1 ? signe(progression.variationKg) : "—"}
                  </dd>
                  {pesees.length > 1 ? null : (
                    <dd className="text-xs text-text-meta">Une seule pesée enregistrée</dd>
                  )}
                </div>
              </dl>
              {progression?.pourcentage !== null && progression?.pourcentage !== undefined ? (
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-text-secondary">Vers votre poids cible</span>
                    <span className="font-semibold text-primary">{progression.pourcentage} %</span>
                  </div>
                  <ProgressBar valeur={progression.pourcentage} label="Progression vers le poids cible" />
                  {progression.resteKg ? (
                    <p className="mt-2 text-sm text-text-meta">Encore {kg(progression.resteKg)}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-text-secondary">Aucune pesée enregistrée pour le moment.</p>
          )}
          <div className="mt-6 border-t border-border pt-5">
            <WeighInForm dejaPeseAujourdhui={derniere?.mesure_le === aujourdhui} />
          </div>
        </Card>

        {/* Séance du jour */}
        <Card aria-labelledby="titre-seance">
          <CardTitle id="titre-seance">Entraînement du jour</CardTitle>
          {seance?.prevue ? (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-on-primary">
                  <Dumbbell aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">
                    {libelle(OPTIONS_ACTIVITE, seance.activite)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Séance {seance.numero} sur {seance.total} cette semaine
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                {profil.duree_seance_min ? (
                  <li className="flex items-center gap-2">
                    <Timer aria-hidden="true" className="size-4 text-text-meta" />
                    {profil.duree_seance_min} min
                  </li>
                ) : null}
                {profil.materiel ? (
                  <li className="flex items-center gap-2">
                    <Dumbbell aria-hidden="true" className="size-4 text-text-meta" />
                    {libelle(OPTIONS_MATERIEL, profil.materiel)}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-surface-raised text-text-secondary">
                <Moon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">Jour de repos</p>
                {seance ? (
                  <p className="text-sm text-text-secondary">
                    Prochaine séance : {NOMS_JOURS[seance.prochainJour]}
                  </p>
                ) : null}
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-text-meta">
            Planning suggéré d’après vos disponibilités. Le programme détaillé arrive avec le module Entraînement.
          </p>
        </Card>

        {/* Nutrition */}
        <Card aria-labelledby="titre-nutrition">
          <CardTitle id="titre-nutrition">Nutrition du jour</CardTitle>
          {besoins ? (
            <>
              <p className="mt-4 font-display text-3xl font-bold">
                {besoins.apportCibleKcal.toLocaleString("fr-FR")}{" "}
                <span className="text-base font-medium text-text-secondary">kcal estimées</span>
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Protéines", besoins.proteinesG],
                  ["Glucides", besoins.glucidesG],
                  ["Lipides", besoins.lipidesG],
                ].map(([nom, grammes]) => (
                  <div key={nom} className="rounded-xl bg-surface-raised px-2 py-3">
                    <dt className="text-xs text-text-meta">{nom}</dt>
                    <dd className="mt-1 font-semibold">{grammes} g</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-text-meta">
                Estimation (formule de Mifflin-St Jeor) selon votre poids, votre activité et votre objectif
                {besoins.precision === "reduite" ? ", moins précise sans le sexe renseigné" : ""}. Ce
                n’est pas un avis médical.
              </p>
            </>
          ) : (
            <p className="mt-4 text-text-secondary">
              Données insuffisantes pour estimer vos besoins.
            </p>
          )}
        </Card>

        {/* Hydratation */}
        <Card aria-labelledby="titre-eau">
          <CardTitle id="titre-eau">Hydratation</CardTitle>
          <p className="mt-4 font-display text-3xl font-bold">
            {litres(eauAujourdhui)}
            {objectifEau ? (
              <span className="text-base font-medium text-text-secondary"> / {litres(objectifEau)}</span>
            ) : null}
          </p>
          {objectifEau ? (
            <ProgressBar
              className="mt-3"
              valeur={(eauAujourdhui / objectifEau) * 100}
              label="Hydratation du jour"
            />
          ) : null}
          <div className="mt-4">
            <HydrationControls peutAnnuler={eauAujourdhui > 0} />
          </div>
          <p className="mt-4 text-xs text-text-meta">Repère indicatif : environ 35 ml par kilo et par jour.</p>
        </Card>

        {/* Statistiques */}
        <Card aria-labelledby="titre-stats">
          <CardTitle id="titre-stats">Statistiques</CardTitle>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Stat nom="Jours de suivi" valeur={String(stats.joursDeSuivi)} />
            <Stat nom="Pesées" valeur={String(stats.nombrePesees)} />
            <Stat
              nom="Poids sur 7 jours"
              valeur={stats.variation7JoursKg === null ? "—" : signe(stats.variation7JoursKg)}
              note={stats.variation7JoursKg === null ? "Pas assez de recul" : undefined}
            />
            <Stat
              nom="Eau / jour (7 j)"
              valeur={stats.moyenneEau7JoursMl === null ? "—" : litres(stats.moyenneEau7JoursMl)}
              note={stats.moyenneEau7JoursMl === null ? "Aucune donnée" : undefined}
            />
          </dl>
        </Card>
      </div>

      {/* Accès rapide */}
      <nav aria-label="Accès rapide" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/programmes", nom: "Programmes", icone: Dumbbell },
          { href: "/seance", nom: "Séance", icone: Timer },
          { href: "/progression", nom: "Progression", icone: ChartLine },
          { href: "/objectifs", nom: "Objectifs", icone: Target },
        ].map(({ href, nom, icone: Icone }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-14 items-center gap-3 rounded-card border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icone aria-hidden="true" className="size-5 text-primary" />
            {nom}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Stat({ nom, valeur, note }: { nom: string; valeur: string; note?: string }) {
  return (
    <div className="rounded-xl bg-surface-raised px-3 py-3">
      <dt className="text-xs text-text-meta">{nom}</dt>
      <dd className="mt-1 font-display text-xl font-bold">{valeur}</dd>
      {note ? <dd className="text-xs text-text-meta">{note}</dd> : null}
    </div>
  );
}

export function TableauDeBordChargement() {
  return (
    <div aria-busy="true" aria-label="Chargement de votre tableau de bord" className="space-y-6">
      <div className="h-16 w-64 animate-pulse rounded-xl bg-surface" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-card bg-surface lg:col-span-2" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    </div>
  );
}
