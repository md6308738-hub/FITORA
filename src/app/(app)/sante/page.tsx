import { CircleAlert, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ConsentementSante } from "@/components/profil/profil-forms";
import { GraphiqueEvolution } from "@/components/progression/graphiques";
import { JournalForm } from "@/components/sante/journal-form";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { signauxSante } from "@/lib/calculs/sante";
import { decalerJour, formaterDateCourte, jourLocal } from "@/lib/dates";
import { exigerProfilComplet } from "@/lib/data/session";
import { getJournalSante } from "@/lib/data/suivi";

export const metadata: Metadata = { title: "Santé" };

export default function SantePage() {
  return (
    <>
      <PageHeader title="Santé et récupération" description="Sommeil, fatigue, douleurs et activité : un suivi personnel, sans diagnostic médical." />
      <Suspense fallback={<div aria-busy="true" aria-label="Chargement du suivi santé" className="h-96 animate-pulse rounded-card bg-surface" />}>
        <ContenuSante />
      </Suspense>
    </>
  );
}

const texte = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

async function ContenuSante() {
  const profil = await exigerProfilComplet();

  if (!profil.consentement_sante_le) {
    return (
      <Card aria-labelledby="titre-consentement">
        <CardTitle id="titre-consentement">Avant de commencer</CardTitle>
        <p className="mt-3 text-text-secondary">Ces données sont sensibles : elles ne sont enregistrées qu’avec ton accord explicite.</p>
        <div className="mt-4">
          <ConsentementSante donneLe={null} />
        </div>
      </Card>
    );
  }

  const aujourdhui = jourLocal();
  const journal = await getJournalSante(decalerJour(aujourdhui, -365));
  const duJour = journal.find((j) => j.jour === aujourdhui) ?? null;
  const signaux = signauxSante(duJour ? { fatigue: duJour.fatigue, douleurIntensite: duJour.douleur_intensite, sommeilMin: duJour.sommeil_min } : null);
  const recents = [...journal].reverse().slice(0, 14);

  return (
    <div className="space-y-6">
      {signaux.map((s) => (
        <p key={s.message} role="status" className={`flex gap-2 rounded-xl border px-4 py-3 text-sm ${s.niveau === "consulter" ? "border-error/40 bg-error/10" : "border-warning/40 bg-warning/10"}`}>
          {s.niveau === "consulter" ? <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-error" /> : <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />}
          {s.message}
        </p>
      ))}

      <Card aria-labelledby="titre-jour">
        <CardTitle id="titre-jour">Aujourd’hui</CardTitle>
        <div className="mt-4">
          <JournalForm
            jour={aujourdhui}
            initial={{
              sommeilHeures: duJour?.sommeil_min ? String(Math.round((duJour.sommeil_min / 60) * 10) / 10).replace(".", ",") : "",
              qualiteSommeil: texte(duJour?.qualite_sommeil),
              fatigue: texte(duJour?.fatigue),
              pas: texte(duJour?.pas),
              douleurZone: duJour?.douleur_zone ?? "",
              douleurIntensite: texte(duJour?.douleur_intensite),
              note: duJour?.note ?? "",
            }}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card aria-labelledby="titre-sommeil">
          <CardTitle id="titre-sommeil">Sommeil</CardTitle>
          <div className="mt-3">
            <GraphiqueEvolution
              titre="Sommeil"
              unite="h"
              aujourdhui={aujourdhui}
              points={journal.filter((j) => j.sommeil_min !== null).map((j) => ({ jour: j.jour, valeur: Math.round(((j.sommeil_min ?? 0) / 60) * 10) / 10 }))}
            />
          </div>
        </Card>
        <Card aria-labelledby="titre-pas">
          <CardTitle id="titre-pas">Pas quotidiens</CardTitle>
          <div className="mt-3">
            <GraphiqueEvolution titre="Pas" unite="pas" aujourdhui={aujourdhui} points={journal.filter((j) => j.pas !== null).map((j) => ({ jour: j.jour, valeur: j.pas ?? 0 }))} />
          </div>
        </Card>
      </div>

      <Card aria-labelledby="titre-historique-sante">
        <CardTitle id="titre-historique-sante">Dernières entrées</CardTitle>
        {recents.length === 0 ? (
          <p className="mt-3 text-text-secondary">Aucune entrée pour le moment.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-meta">
                  {["Date", "Sommeil", "Qualité", "Fatigue", "Pas", "Douleur", "Source"].map((t) => <th key={t} className="py-2 pr-4 font-medium">{t}</th>)}
                </tr>
              </thead>
              <tbody>
                {recents.map((j) => (
                  <tr key={j.jour} className="border-t border-border">
                    <td className="py-2 pr-4">{formaterDateCourte(j.jour)}</td>
                    <td className="py-2 pr-4">{j.sommeil_min !== null ? `${Math.floor(j.sommeil_min / 60)} h ${String(j.sommeil_min % 60).padStart(2, "0")}` : "—"}</td>
                    <td className="py-2 pr-4">{j.qualite_sommeil ?? "—"}</td>
                    <td className="py-2 pr-4">{j.fatigue ?? "—"}</td>
                    <td className="py-2 pr-4">{j.pas?.toLocaleString("fr-FR") ?? "—"}</td>
                    <td className="py-2 pr-4">{j.douleur_intensite ? `${j.douleur_intensite}/10${j.douleur_zone ? ` (${j.douleur_zone})` : ""}` : "—"}</td>
                    <td className="py-2 pr-4 text-text-meta">Saisie manuelle</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-text-meta">
          FITORA ne pose aucun diagnostic et ne remplace pas un professionnel de santé. En cas de douleur persistante ou inhabituelle, consulte un médecin.
        </p>
      </Card>
    </div>
  );
}
