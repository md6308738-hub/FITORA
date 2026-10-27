"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { decalerJour, formaterDateCourte } from "@/lib/dates";

const PERIODES = [
  { jours: 7, libelle: "7 j" },
  { jours: 30, libelle: "30 j" },
  { jours: 90, libelle: "90 j" },
  { jours: 365, libelle: "12 mois" },
] as const;

const COULEUR = "var(--color-primary)";
const AXE = { fontSize: 12, fill: "var(--color-text-meta)" };

const nombreFr = (v: number, unite: string) => `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${unite}`;
const graduation = (v: number) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

/** Bouton bascule graphique / tableau (le tableau est la vue accessible des données). */
function Bascule({ tableau, onChange }: { tableau: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!tableau)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
      {tableau ? "Voir le graphique" : "Voir le tableau"}
    </button>
  );
}

/** Évolution d'une mesure dans le temps, avec choix de période (cahier des charges § 13.2). */
export function GraphiqueEvolution({
  titre,
  unite,
  points,
  aujourdhui,
}: {
  titre: string;
  unite: string;
  points: { jour: string; valeur: number }[];
  aujourdhui: string;
}) {
  const [jours, setJours] = useState<number>(90);
  const [tableau, setTableau] = useState(false);
  const visibles = useMemo(() => {
    const debut = decalerJour(aujourdhui, -(jours - 1));
    return points.filter((p) => p.jour >= debut).sort((a, b) => a.jour.localeCompare(b.jour));
  }, [points, jours, aujourdhui]);

  return (
    <figure className="m-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="font-semibold">{titre}</figcaption>
        <div role="group" aria-label={`Période — ${titre}`} className="flex gap-1">
          {PERIODES.map((p) => (
            <button
              key={p.jours}
              type="button"
              aria-pressed={jours === p.jours}
              onClick={() => setJours(p.jours)}
              className={`min-h-9 rounded-lg px-2.5 text-sm font-medium ${jours === p.jours ? "bg-primary-soft text-primary" : "text-text-secondary hover:text-text"}`}
            >
              {p.libelle}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-text-meta">
        {visibles.length === 0
          ? "Aucune donnée enregistrée sur cette période."
          : `${visibles.length} mesure${visibles.length > 1 ? "s" : ""} enregistrée${visibles.length > 1 ? "s" : ""} sur la période — les jours sans mesure ne sont pas représentés.`}
      </p>
      {visibles.length > 0 && !tableau ? (
        <div className="mt-3 h-56" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibles} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="jour" tickFormatter={formaterDateCourte} tick={AXE} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} tick={AXE} tickLine={false} axisLine={false} width={56} tickFormatter={graduation} />
              <Tooltip
                formatter={(v) => [nombreFr(Number(v), unite), titre]}
                labelFormatter={(l) => formaterDateCourte(String(l))}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 13 }}
              />
              <Line type="monotone" dataKey="valeur" stroke={COULEUR} strokeWidth={2} dot={{ r: 4, fill: COULEUR, stroke: "var(--color-surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      {visibles.length > 0 && tableau ? (
        <div className="mt-3 max-h-56 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-meta"><th className="py-1 font-medium">Date</th><th className="py-1 font-medium">{titre}</th></tr></thead>
            <tbody>
              {[...visibles].reverse().map((p) => (
                <tr key={p.jour} className="border-t border-border"><td className="py-1.5">{formaterDateCourte(p.jour)}</td><td className="py-1.5">{nombreFr(p.valeur, unite)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {visibles.length > 0 ? <Bascule tableau={tableau} onChange={setTableau} /> : null}
    </figure>
  );
}

/** Séances réalisées par semaine (12 dernières semaines). */
export function GraphiqueSeances({ donnees, cible }: { donnees: { semaine: string; nombre: number }[]; cible: number | null }) {
  const [tableau, setTableau] = useState(false);
  return (
    <figure className="m-0">
      <figcaption className="font-semibold">Séances par semaine</figcaption>
      <p className="mt-1 text-sm text-text-meta">12 dernières semaines{cible ? ` · objectif : ${cible} par semaine` : ""}</p>
      {tableau ? (
        <div className="mt-3 max-h-56 overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-text-meta"><th className="py-1 font-medium">Semaine du</th><th className="py-1 font-medium">Séances</th></tr></thead>
            <tbody>
              {[...donnees].reverse().map((d) => (
                <tr key={d.semaine} className="border-t border-border"><td className="py-1.5">{formaterDateCourte(d.semaine)}</td><td className="py-1.5">{d.nombre}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 h-48" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={donnees} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barCategoryGap={4}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="semaine" tickFormatter={formaterDateCourte} tick={AXE} tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} tick={AXE} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                cursor={{ fill: "var(--color-primary-soft)" }}
                formatter={(v) => [`${v} séance${Number(v) > 1 ? "s" : ""}`, "Réalisées"]}
                labelFormatter={(l) => `Semaine du ${formaterDateCourte(String(l))}`}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 13 }}
              />
              <Bar dataKey="nombre" fill={COULEUR} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <Bascule tableau={tableau} onChange={setTableau} />
    </figure>
  );
}
