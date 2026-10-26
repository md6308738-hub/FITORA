"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { CATALOGUE, LIBELLES_MATERIEL, type Materiel } from "@/lib/exercices/catalogue";
import { OPTIONS_NIVEAU, libelle } from "@/lib/onboarding/options";
import type { NiveauSportif } from "@/types/database";

const CHAMP =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-text focus-visible:outline-2 focus-visible:outline-primary";

const GROUPES = [...new Set(CATALOGUE.map((e) => e.groupe))].sort((a, b) => a.localeCompare(b, "fr"));
const MATERIELS = Object.keys(LIBELLES_MATERIEL) as Materiel[];

const sansAccents = (texte: string) => texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function Bibliotheque() {
  const [recherche, setRecherche] = useState("");
  const [groupe, setGroupe] = useState("");
  const [materiel, setMateriel] = useState("");
  const [niveau, setNiveau] = useState("");

  const resultats = useMemo(
    () =>
      CATALOGUE.filter(
        (e) =>
          (!recherche || sansAccents(`${e.nom} ${e.groupe} ${e.secondaires.join(" ")}`).includes(sansAccents(recherche))) &&
          (!groupe || e.groupe === groupe) &&
          (!materiel || e.materiel.includes(materiel as Materiel)) &&
          (!niveau || e.niveau === niveau),
      ),
    [recherche, groupe, materiel, niveau],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium">
          Rechercher
          <input type="search" className={`${CHAMP} mt-1.5`} value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Squat, dos, pompes…" />
        </label>
        <label className="text-sm font-medium">
          Muscle principal
          <select className={`${CHAMP} mt-1.5`} value={groupe} onChange={(e) => setGroupe(e.target.value)}>
            <option value="">Tous</option>
            {GROUPES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Matériel
          <select className={`${CHAMP} mt-1.5`} value={materiel} onChange={(e) => setMateriel(e.target.value)}>
            <option value="">Tous</option>
            {MATERIELS.map((m) => (
              <option key={m} value={m}>
                {LIBELLES_MATERIEL[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Niveau
          <select className={`${CHAMP} mt-1.5`} value={niveau} onChange={(e) => setNiveau(e.target.value)}>
            <option value="">Tous</option>
            {OPTIONS_NIVEAU.map((n) => (
              <option key={n.valeur} value={n.valeur}>
                {n.libelle}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="text-sm text-text-meta">
        {resultats.length} exercice{resultats.length > 1 ? "s" : ""}
      </p>

      {resultats.length === 0 ? (
        <EmptyState title="Aucun exercice trouvé" description="Modifie la recherche ou les filtres." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((e) => (
            <li key={e.id}>
              <Link
                href={`/programmes/exercices/${e.id}`}
                className="flex h-full flex-col rounded-card border border-border bg-surface p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="font-semibold">{e.nom}</span>
                <span className="mt-1 text-sm text-text-secondary">{e.groupe}</span>
                <span className="mt-3 text-xs text-text-meta">
                  {e.materiel.map((m) => LIBELLES_MATERIEL[m]).join(" + ")} · {libelle(OPTIONS_NIVEAU, e.niveau as NiveauSportif)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
