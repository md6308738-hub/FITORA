import type { Metadata } from "next";
import { Suspense } from "react";

import { GraphiqueEvolution, GraphiqueSeances } from "@/components/progression/graphiques";
import { ListeObjectifs, Mensurations, NouvelObjectif, type ObjectifAffiche } from "@/components/progression/suivi-forms";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { objectifHydratationMl, totalParJour } from "@/lib/calculs/hydratation";
import { avancementObjectif, bilanPeriode, lundiDe, meilleuresCharges, regularite, seancesParSemaine } from "@/lib/calculs/suivi";
import { decalerJour, jourLocal } from "@/lib/dates";
import { getPrisesEauDepuis } from "@/lib/data/hydratation";
import { getPesees } from "@/lib/data/pesees";
import { exigerProfilComplet } from "@/lib/data/session";
import { getJournalSante, getMensurations, getObjectifs, getSeancesTerminees } from "@/lib/data/suivi";
import { trouverExercice } from "@/lib/exercices/catalogue";

export const metadata: Metadata = { title: "Progrès" };

export default function ProgressionPage() {
  return (
    <>
      <PageHeader title="Progrès" description="Tes mesures, tes performances et tes objectifs, d’après tes données enregistrées." />
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement des progrès" className="h-96 animate-pulse rounded-card bg-surface" />}>
        <ContenuProgression />
      </Suspense>
    </>
  );
}

const kg = (v: number) => `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg`;

async function ContenuProgression() {
  const profil = await exigerProfilComplet();
  const aujourdhui = jourLocal();
  const ilYaUnAn = decalerJour(aujourdhui, -365);
  const debutMois = `${aujourdhui.slice(0, 8)}01`;

  const [pesees, mensurations, objectifs, { seances, series }, prises, journal] = await Promise.all([
    getPesees(),
    getMensurations(),
    getObjectifs(),
    getSeancesTerminees(`${ilYaUnAn}T00:00:00Z`),
    getPrisesEauDepuis(debutMois < decalerJour(aujourdhui, -6) ? debutMois : decalerJour(aujourdhui, -6)),
    getJournalSante(aujourdhui),
  ]);

  const joursSeances = seances.map((s) => jourLocal(new Date(s.commencee_le)));
  const parSemaine = seancesParSemaine(joursSeances, aujourdhui);
  const cible = profil.jours_par_semaine;
  const regulier = cible ? regularite(parSemaine, cible) : null;
  const durees = seances.filter((s) => s.terminee_le).map((s) => (Date.parse(s.terminee_le ?? "") - Date.parse(s.commencee_le)) / 60000);
  const dureeMoyenne = durees.length ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : null;
  const records = meilleuresCharges(series).slice(0, 6);

  const eauParJour = totalParJour(prises);
  const poidsActuel = pesees.at(-1)?.poids_kg ?? null;
  const objectifEau = poidsActuel ? objectifHydratationMl(poidsActuel) : null;
  const seancesCetteSemaine = joursSeances.filter((j) => lundiDe(j) === lundiDe(aujourdhui)).length;

  const objectifsAffiches: ObjectifAffiche[] = objectifs.map((o) => {
    const depart = [...pesees].reverse().find((p) => p.mesure_le <= o.debut_le) ?? pesees[0];
    return {
      id: o.id,
      type: o.type,
      cible: o.cible,
      echeance: o.echeance_le,
      statut: o.statut,
      avancement: avancementObjectif(o.type, o.cible, {
        poidsDepart: depart?.poids_kg ?? null,
        poidsActuel,
        seancesCetteSemaine,
        eauAujourdhuiMl: eauParJour.get(aujourdhui) ?? 0,
        pasAujourdhui: journal.find((j) => j.jour === aujourdhui)?.pas ?? null,
      }),
    };
  });

  const bilan = bilanPeriode({
    debut: debutMois,
    fin: aujourdhui,
    joursSeances,
    seancesParSemaineCible: cible,
    pesees: pesees.map((p) => ({ jour: p.mesure_le, poids: p.poids_kg })),
    eauParJour,
    objectifEauMl: objectifEau,
    objectifsAtteints: objectifs.filter((o) => o.statut === "atteint").length,
  });
  const nomMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "Africa/Dakar" }).format(new Date());

  return (
    <div className="space-y-6">
      <Card aria-labelledby="titre-bilan">
        <CardTitle id="titre-bilan">Bilan de {nomMois}</CardTitle>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Séances", bilan.seancesPrevues ? `${bilan.seances} / ${bilan.seancesPrevues}` : String(bilan.seances)],
            ["Poids sur le mois", bilan.variationPoidsKg === null ? "—" : `${bilan.variationPoidsKg > 0 ? "+" : ""}${kg(bilan.variationPoidsKg)}`],
            ["Jours d’hydratation atteinte", bilan.joursAvecDonneesEau ? `${bilan.joursHydratationAtteinte} / ${bilan.joursAvecDonneesEau}` : "—"],
            ["Objectifs atteints", String(bilan.objectifsAtteints)],
          ].map(([nom, valeur]) => (
            <div key={nom} className="rounded-xl bg-surface-raised px-3 py-3">
              <dt className="text-xs text-text-meta">{nom}</dt>
              <dd className="mt-1 font-display text-xl font-bold">{valeur}</dd>
            </div>
          ))}
        </dl>
        {bilan.aAmeliorer.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">À améliorer</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">{bilan.aAmeliorer.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Pour le mois prochain</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">{bilan.propositions.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-secondary">Rien à signaler : continue sur ce rythme.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card aria-labelledby="titre-poids-graphique">
          <CardTitle id="titre-poids-graphique">Poids</CardTitle>
          <div className="mt-3">
            <GraphiqueEvolution titre="Poids" unite="kg" aujourdhui={aujourdhui} points={pesees.map((p) => ({ jour: p.mesure_le, valeur: p.poids_kg }))} />
          </div>
        </Card>
        <Card aria-labelledby="titre-mensurations">
          <CardTitle id="titre-mensurations">Mensurations</CardTitle>
          <div className="mt-3">
            <Mensurations aujourdhui={aujourdhui} points={mensurations.map((m) => ({ type: m.type, jour: m.mesure_le, valeur: m.valeur }))} />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="titre-entrainement">
        <CardTitle id="titre-entrainement">Entraînement</CardTitle>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Séances (12 mois)", String(seances.length)],
            ["Régularité", regulier === null ? "—" : `${regulier} %`],
            ["Durée moyenne", dureeMoyenne === null ? "—" : `${dureeMoyenne} min`],
            ["Séries enregistrées", String(series.length)],
          ].map(([nom, valeur]) => (
            <div key={nom} className="rounded-xl bg-surface-raised px-3 py-3">
              <dt className="text-xs text-text-meta">{nom}</dt>
              <dd className="mt-1 font-display text-xl font-bold">{valeur}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <GraphiqueSeances donnees={parSemaine} cible={cible} />
          <div>
            <h3 className="font-semibold">Meilleures charges</h3>
            {records.length === 0 ? (
              <p className="mt-2 text-sm text-text-meta">Aucune charge enregistrée pour le moment.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {records.map((r) => (
                  <li key={r.exerciceId} className="flex justify-between gap-3 py-2 text-sm">
                    <span>{trouverExercice(r.exerciceId)?.nom ?? r.exerciceId}</span>
                    <span className="font-semibold">{kg(r.chargeKg)} × {r.repetitions}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <Card aria-labelledby="titre-objectifs">
        <CardTitle id="titre-objectifs">Objectifs</CardTitle>
        <div className="mt-4 space-y-6">
          <ListeObjectifs objectifs={objectifsAffiches} />
          <div className="border-t border-border pt-5">
            <h3 className="mb-3 font-semibold">Nouvel objectif</h3>
            <NouvelObjectif />
          </div>
        </div>
      </Card>
    </div>
  );
}
