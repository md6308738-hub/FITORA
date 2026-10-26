import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { formaterPrescription, nomJour } from "@/components/programmes/format";
import { DemarrerSeance } from "@/components/seance/demarrer-seance";
import { SeanceEnDirect, type ExerciceSeance } from "@/components/seance/seance-en-direct";
import { styleBouton } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { jourSemaine } from "@/lib/dates";
import { getProgramme, getSeancesDuProgramme, type SeanceComplete } from "@/lib/data/programmes";
import { getDernieresPerformances, getHistorique, getSeanceEnCours, getSeriesDeSeance } from "@/lib/data/seances";
import { exigerProfilComplet } from "@/lib/data/session";
import { trouverExercice } from "@/lib/exercices/catalogue";
import { suggererCharge } from "@/lib/programmes/generateur";
import type { Seance, SerieRealisee } from "@/types/database";

export const metadata: Metadata = { title: "Séance" };

export default function SeancePage() {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Chargement de la séance" className="h-72 animate-pulse rounded-card bg-surface" />}>
      <ContenuSeance />
    </Suspense>
  );
}

function resume(series: readonly SerieRealisee[]): string | null {
  if (series.length === 0) return null;
  const premiere = series[0];
  if (premiere?.duree_sec !== null && premiere?.duree_sec !== undefined) {
    return series.map((s) => `${s.duree_sec} s`).join(", ");
  }
  const charges = [...new Set(series.map((s) => s.charge_kg ?? 0))];
  const reps = series.map((s) => s.repetitions ?? 0).join("/");
  const charge = charges.length === 1 && charges[0] ? ` à ${String(charges[0]).replace(".", ",")} kg` : "";
  return `${series.length} séries (${reps})${charge}`;
}

async function SeanceEnCours({ seance }: { seance: Seance }) {
  const programme = seance.programme_seance_id ? await chargerSeanceType(seance.programme_seance_id) : null;
  const lignes = programme?.exercices ?? [];
  const [enregistrees, dernieres] = await Promise.all([
    getSeriesDeSeance(seance.id),
    getDernieresPerformances(lignes.map((l) => l.exercice_id)),
  ]);

  const exercices: ExerciceSeance[] = lignes.flatMap((ligne) => {
    const exercice = trouverExercice(ligne.exercice_id);
    if (!exercice) return [];
    const precedentes = dernieres[ligne.exercice_id] ?? [];
    return [
      {
        exerciceId: exercice.id,
        nom: exercice.nom,
        mesure: exercice.mesure,
        series: ligne.series,
        reposSec: ligne.repos_sec,
        prescription: formaterPrescription(ligne),
        derniereFois: resume(precedentes),
        suggestion: suggererCharge(
          precedentes.map((s) => ({ chargeKg: s.charge_kg, repetitions: s.repetitions })),
          ligne.reps_max,
        ),
        enregistrees: enregistrees
          .filter((s) => s.exercice_id === exercice.id)
          .map((s) => ({ numero: s.numero, chargeKg: s.charge_kg, repetitions: s.repetitions, dureeSec: s.duree_sec })),
      },
    ];
  });

  return <SeanceEnDirect seanceId={seance.id} nom={seance.nom} commenceeLe={seance.commencee_le} exercices={exercices} />;
}

async function chargerSeanceType(programmeSeanceId: string): Promise<SeanceComplete | null> {
  for (const statut of ["actif", "archive"] as const) {
    const programme = await getProgramme(statut);
    const trouvee = programme?.seances.find((s) => s.id === programmeSeanceId);
    if (trouvee) return trouvee;
  }
  return null;
}

function ApercuSeance({ seance }: { seance: SeanceComplete }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {seance.exercices.map((ligne) => (
        <li key={ligne.id} className="flex justify-between gap-3">
          <span>{trouverExercice(ligne.exercice_id)?.nom ?? ligne.exercice_id}</span>
          <span className="shrink-0 text-text-meta">{formaterPrescription(ligne)}</span>
        </li>
      ))}
    </ul>
  );
}

async function ContenuSeance() {
  await exigerProfilComplet();
  const enCours = await getSeanceEnCours();
  if (enCours) return <SeanceEnCours seance={enCours} />;

  const [programme, historique] = await Promise.all([getProgramme("actif"), getHistorique()]);
  const aujourdhui = jourSemaine();
  const seances = programme ? await getSeancesDuProgramme(programme.id) : [];
  const duJour = seances.find((s) => s.jour_semaine === aujourdhui);
  const autres = seances.filter((s) => s !== duJour);

  return (
    <>
      <PageHeader title="Séance" description="Lance ta séance et enregistre chaque série." />
      {!programme ? (
        <div className="space-y-4">
          <EmptyState
            title="Aucun programme actif"
            description="Génère et valide ton programme pour pouvoir lancer tes séances."
          />
          <Link href="/programmes" className={styleBouton("primaire")}>
            Aller aux programmes
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card aria-labelledby="titre-du-jour">
            <CardTitle id="titre-du-jour">Aujourd’hui</CardTitle>
            {duJour ? (
              <>
                <p className="mt-3 font-display text-xl font-bold">{duJour.nom}</p>
                <ApercuSeance seance={duJour} />
                <div className="mt-5">
                  <DemarrerSeance programmeSeanceId={duJour.id} />
                </div>
              </>
            ) : (
              <p className="mt-3 text-text-secondary">Jour de repos dans ton programme. Tu peux tout de même lancer une autre séance.</p>
            )}
          </Card>
          {autres.length > 0 ? (
            <Card aria-labelledby="titre-autres">
              <CardTitle id="titre-autres">Autres séances du programme</CardTitle>
              <ul className="mt-3 divide-y divide-border">
                {autres.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span>
                      <span className="font-medium">{s.nom}</span>
                      <span className="block text-sm text-text-meta">Prévue le {nomJour(s.jour_semaine).toLowerCase()}</span>
                    </span>
                    <DemarrerSeance programmeSeanceId={s.id} libelle="Démarrer" />
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      )}

      <section aria-labelledby="titre-historique" className="mt-10">
        <h2 id="titre-historique" className="font-display text-xl font-bold">
          Historique
        </h2>
        {historique.length === 0 ? (
          <p className="mt-3 text-text-secondary">Aucune séance terminée pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-card border border-border bg-surface">
            {historique.map((s) => {
              const minutes = s.terminee_le ? Math.max(1, Math.round((Date.parse(s.terminee_le) - Date.parse(s.commencee_le)) / 60000)) : null;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                  <span>
                    <span className="font-medium">{s.nom}</span>
                    <span className="block text-sm text-text-meta">
                      {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Dakar" }).format(new Date(s.commencee_le))}
                    </span>
                  </span>
                  <span className="text-sm text-text-secondary">
                    {s.nombreSeries} série{s.nombreSeries > 1 ? "s" : ""}
                    {minutes ? ` · ${minutes} min` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
