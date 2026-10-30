import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Dumbbell, Droplets, Moon, Target, Utensils } from "lucide-react";

import { HydrationControls } from "@/components/dashboard/hydration-controls";
import { WeighInForm } from "@/components/dashboard/weigh-in-form";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { objectifHydratationMl, totalParJour } from "@/lib/calculs/hydratation";
import { estimerBesoins } from "@/lib/calculs/nutrition";
import { progressionPoids } from "@/lib/calculs/progression";
import { calculerStatistiques } from "@/lib/calculs/statistiques";
import { decalerJour, formaterDateCourte, jourLocal, jourSemaine } from "@/lib/dates";
import { getPrisesEauDepuis } from "@/lib/data/hydratation";
import { getRepasDuJour } from "@/lib/data/nutrition";
import { getPesees } from "@/lib/data/pesees";
import { getHistorique } from "@/lib/data/seances";
import { getProgramme } from "@/lib/data/programmes";
import { exigerProfilComplet } from "@/lib/data/session";
import { trouverExercice } from "@/lib/exercices/catalogue";
import { apports, somme, trouverAliment } from "@/lib/nutrition/aliments";
import { OPTIONS_OBJECTIF, libelle } from "@/lib/onboarding/options";
import { NOMS_JOURS } from "@/lib/calculs/planning";

const kg = (valeur: number) => `${valeur.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg`;
const litres = (ml: number) => `${(ml / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} L`;
const signe = (valeur: number) => (valeur > 0 ? `+${kg(valeur)}` : kg(valeur));

function CercleProgression({ valeur, pourcentage }: { valeur: number; pourcentage: number | null | undefined }) {
  const rayon = 47;
  const tour = 2 * Math.PI * rayon;
  const avancement = pourcentage === null || pourcentage === undefined ? 0 : Math.max(0, Math.min(1, pourcentage / 100));
  return (
    <div role="img" aria-label={pourcentage === null || pourcentage === undefined ? `${kg(valeur)}, poids actuel` : `${kg(valeur)}, ${pourcentage} pour cent de progression vers l’objectif`} className="relative size-36 shrink-0">
      <svg aria-hidden="true" viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={rayon} fill="none" className="stroke-border" strokeWidth="9" />
        <circle cx="60" cy="60" r={rayon} fill="none" className="stroke-primary" strokeWidth="9" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - avancement)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <strong className="font-display text-2xl">{kg(valeur)}</strong>
        <span className="text-xs text-text-secondary">Poids actuel</span>
      </div>
    </div>
  );
}

function CercleCalories({ valeur, cible }: { valeur: number; cible: number | null }) {
  const rayon = 42;
  const tour = 2 * Math.PI * rayon;
  const avancement = cible && cible > 0 ? Math.min(1, valeur / cible) : 0;
  return (
    <div role="img" aria-label={cible ? `${Math.round(valeur)} kilocalories estimées sur ${cible} estimées` : `${Math.round(valeur)} kilocalories estimées`} className="relative size-32 shrink-0">
      <svg aria-hidden="true" viewBox="0 0 110 110" className="size-full -rotate-90">
        <circle cx="55" cy="55" r={rayon} fill="none" className="stroke-border" strokeWidth="8" />
        <circle cx="55" cy="55" r={rayon} fill="none" className="stroke-primary" strokeWidth="8" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - avancement)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <strong className="font-display text-xl">{Math.round(valeur).toLocaleString("fr-FR")}</strong>
        <span className="text-xs text-text-secondary">kcal estimées</span>
        <span className="text-[10px] text-text-meta">{cible ? `sur ${cible.toLocaleString("fr-FR")}` : "consommées"}</span>
      </div>
    </div>
  );
}

function TuileSeance({ nom, jour, nombreExercices }: { nom: string; jour: string; nombreExercices: number }) {
  return (
    <Link href="/programmes#programme-actif" className="group min-w-48 flex-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
      <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary-soft px-3 text-xs font-semibold text-primary capitalize">
        <CalendarDays aria-hidden="true" className="size-3.5" />{jour}
      </span>
      <h3 className="mt-3 font-display font-bold">{nom}</h3>
      <p className="mt-1 text-sm text-text-meta">{nombreExercices} exercice{nombreExercices > 1 ? "s" : ""}</p>
      <span className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">Voir la séance <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></span>
    </Link>
  );
}

/** Accueil connecté : les mesures, séances, repas et prises d’eau sont lues dans les données du membre. */
export async function AccueilPremium() {
  const profil = await exigerProfilComplet();
  const aujourdHui = jourLocal();
  const [pesees, prises, programme, repas, historique] = await Promise.all([
    getPesees(),
    getPrisesEauDepuis(decalerJour(aujourdHui, -6)),
    getProgramme("actif"),
    getRepasDuJour(aujourdHui),
    getHistorique(4),
  ]);

  const premiere = pesees[0];
  const derniere = pesees.at(-1);
  const debutSuivi = premiere?.mesure_le ?? jourLocal(new Date(profil.cree_le));
  const stats = calculerStatistiques(pesees, prises, debutSuivi, aujourdHui);
  const progression = premiere && derniere
    ? progressionPoids(premiere.poids_kg, derniere.poids_kg, profil.poids_objectif_kg, profil.objectif)
    : null;
  const besoins = derniere && profil.taille_cm && profil.age && profil.niveau_activite && profil.objectif
    ? estimerBesoins({ poidsKg: derniere.poids_kg, tailleCm: profil.taille_cm, age: profil.age, sexe: profil.sexe, niveauActivite: profil.niveau_activite, objectif: profil.objectif })
    : null;
  const apportsJour = somme(repas.flatMap((repasEntree) => {
    const aliment = trouverAliment(repasEntree.aliment_id);
    return aliment ? [apports(aliment, repasEntree.quantite_g)] : [];
  }));
  const prisesAujourdhui = prises.filter((prise) => prise.jour === aujourdHui);
  const eauAujourdhui = totalParJour(prisesAujourdhui).get(aujourdHui) ?? 0;
  const objectifEau = derniere ? objectifHydratationMl(derniere.poids_kg) : null;
  const jour = jourSemaine();
  const seancesTriees = [...(programme?.seances ?? [])].sort((a, b) => a.jour_semaine - b.jour_semaine || a.ordre - b.ordre);
  const seanceDuJour = seancesTriees.find((seance) => seance.jour_semaine === jour);
  const seancesFutures = seancesTriees.filter((seance) => seance.jour_semaine >= jour);
  const prochaines = (seancesFutures.length ? seancesFutures : seancesTriees).slice(0, 4);
  const dateTexte = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Dakar" }).format(new Date());

  return (
    <div className="w-full space-y-6 lg:space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-meta first-letter:uppercase">{dateTexte}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Bonjour, {profil.prenom}</h1>
          {profil.objectif ? <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-sm font-semibold text-primary"><Target aria-hidden="true" className="size-4" />Objectif : {libelle(OPTIONS_OBJECTIF, profil.objectif)}</p> : null}
        </div>
        <Link href="/programmes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">Gérer mon programme <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </header>

      <section className="relative isolate flex min-h-64 overflow-hidden rounded-card bg-primary text-white sm:min-h-72 xl:min-h-80" aria-labelledby="titre-accueil-hero">
        <Image src="/images/banniere-athlete.jpg" alt="Athlète réalisant un curl avec un haltère dans une salle de sport" fill priority sizes="100vw" className="-z-20 object-cover object-[62%_center]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#06152e]/95 via-[#06152e]/65 to-[#06152e]/10" />
        <div className="flex w-full flex-col items-start justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
          <p className="text-xs font-semibold tracking-[0.24em] text-white/85 uppercase">Ta force. Ton rythme. Ton évolution.</p>
          <h2 id="titre-accueil-hero" className="mt-3 max-w-3xl font-display text-4xl leading-[0.92] font-extrabold tracking-tight uppercase sm:text-5xl xl:text-6xl">Atteins tes <span className="block text-accent-clair">objectifs</span></h2>
          <p className="mt-4 max-w-lg text-sm text-white/90 sm:text-base">Entraînement, nutrition et suivi pensés pour avancer à ton rythme.</p>
          <Link href={programme ? "/seance" : "/programmes"} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            {programme ? "Commencer ma séance" : "Créer mon programme"}<ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      {programme ? (
        <section aria-labelledby="titre-programme-semaine" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-semibold text-primary">Programme actif</p><h2 id="titre-programme-semaine" className="mt-1 font-display text-xl font-bold">{programme.titre}</h2></div>
            <Link href="/programmes" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">Voir le programme <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          {prochaines.length > 0 ? <div className="flex gap-3 overflow-x-auto pb-1">{prochaines.map((seance) => <TuileSeance key={seance.id} nom={seance.nom} jour={NOMS_JOURS[seance.jour_semaine] ?? "Séance"} nombreExercices={seance.exercices.length} />)}</div> : <p className="text-sm text-text-secondary">Aucune séance planifiée dans ce programme.</p>}
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface p-5 sm:p-6" aria-labelledby="titre-programme-vide">
          <div><p className="text-sm font-semibold text-primary">Entraînement</p><h2 id="titre-programme-vide" className="mt-1 font-display text-xl font-bold">Ton programme n’est pas encore activé</h2><p className="mt-1 text-sm text-text-secondary">Génère une proposition à partir de tes disponibilités et de ton matériel.</p></div>
          <Link href="/programmes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Découvrir les programmes <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </section>
      )}

      <div className="grid items-stretch gap-4 xl:grid-cols-3">
        <Card aria-labelledby="titre-seance-aujourdhui" className="h-full">
          <div className="flex items-center justify-between gap-3"><CardTitle id="titre-seance-aujourdhui">Séance du jour</CardTitle><Dumbbell aria-hidden="true" className="size-5 text-primary" /></div>
          {programme ? (
            <div className="mt-4">
              <h2 className="font-display text-xl font-bold">{seanceDuJour?.nom ?? "Jour de repos"}</h2>
              <p className="mt-1 text-sm text-text-secondary">{seanceDuJour ? `${seanceDuJour.exercices.length} exercices · ${programme.duree_seance_min} min` : "Aucune séance prévue aujourd’hui selon ton programme."}</p>
              {seanceDuJour?.exercices.length ? <ul className="mt-4 space-y-2 text-sm text-text-secondary">{seanceDuJour.exercices.slice(0, 3).map((exercice) => <li key={exercice.id} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{trouverExercice(exercice.exercice_id)?.nom ?? exercice.exercice_id}</li>)}</ul> : null}
              <Link href="/seance" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">{seanceDuJour ? "Démarrer la séance" : "Voir mes séances"}<ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          ) : <div className="mt-4"><h2 className="font-display text-xl font-bold">{seanceDuJour ? libelle(OPTIONS_OBJECTIF, profil.objectif ?? "maintien") : "Planifier tes entraînements"}</h2><p className="mt-2 text-sm text-text-secondary">{profil.jours_par_semaine ? `${profil.jours_par_semaine} jours disponibles par semaine · ${profil.duree_seance_min ?? "Durée non définie"} min` : "Ajoute tes disponibilités pour personnaliser ton planning."}</p><Link href="/programmes" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">Voir les programmes <ArrowRight aria-hidden="true" className="size-4" /></Link></div>}
        </Card>

        <Card aria-labelledby="titre-progression" className="h-full">
          <div className="flex items-center justify-between gap-3"><CardTitle id="titre-progression">Progression</CardTitle><Link href="/progression" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">Détails <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
          {derniere ? (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-between"><CercleProgression valeur={derniere.poids_kg} pourcentage={progression?.pourcentage} /><div className="grid min-w-36 flex-1 gap-2"><div className="rounded-xl bg-primary-soft p-3"><p className="text-xs text-text-secondary">Poids cible</p><p className="mt-1 font-display text-xl font-bold">{profil.poids_objectif_kg ? kg(profil.poids_objectif_kg) : "—"}</p></div><div className="rounded-xl bg-surface-raised p-3"><p className="text-xs text-text-secondary">Évolution enregistrée</p><p className="mt-1 font-display text-xl font-bold">{progression && pesees.length > 1 ? signe(progression.variationKg) : "—"}</p></div></div></div>
              {progression?.pourcentage !== null && progression?.pourcentage !== undefined ? <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span className="text-text-secondary">Vers ton objectif</span><strong>{progression.pourcentage} %</strong></div><ProgressBar valeur={progression.pourcentage} label="Progression vers le poids cible" /></div> : null}
              <div className="mt-4 border-t border-border pt-4"><WeighInForm dejaPeseAujourdhui={derniere.mesure_le === aujourdHui} /></div>
            </>
          ) : <div className="mt-4"><p className="text-sm text-text-secondary">Aucune pesée enregistrée. Ajoute une mesure pour suivre ton évolution.</p><div className="mt-4"><WeighInForm dejaPeseAujourdhui={false} /></div></div>}
        </Card>

        <Card aria-labelledby="titre-nutrition-accueil" className="h-full">
          <div className="flex items-center justify-between gap-3"><CardTitle id="titre-nutrition-accueil">Nutrition du jour</CardTitle><Utensils aria-hidden="true" className="size-5 text-primary" /></div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-between"><CercleCalories valeur={apportsJour.kcal} cible={besoins?.apportCibleKcal ?? null} /><dl className="grid min-w-36 flex-1 gap-3">{[["Protéines", apportsJour.proteines, besoins?.proteinesG], ["Glucides", apportsJour.glucides, besoins?.glucidesG], ["Lipides", apportsJour.lipides, besoins?.lipidesG]].map(([nom, consomme, cible]) => <div key={String(nom)} className="flex items-center justify-between gap-2 border-b border-border pb-2 text-xs"><dt className="text-text-secondary">{nom}</dt><dd className="font-semibold">{Math.round(Number(consomme))} g{cible ? ` / ${cible} g` : ""}</dd></div>)}</dl></div>
          <p className="mt-3 text-xs text-text-meta">Apports du journal ; objectifs nutritionnels estimés{besoins ? " selon ton profil" : " indisponibles sans les informations nécessaires"}.</p>
          <Link href="/nutrition" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-primary hover:border-primary">Voir mon suivi nutritionnel <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
        <Card aria-labelledby="titre-hydratation" className="h-full">
          <div className="flex items-center justify-between gap-3"><CardTitle id="titre-hydratation">Hydratation</CardTitle><Droplets aria-hidden="true" className="size-5 text-primary" /></div>
          <p className="mt-3 font-display text-3xl font-bold">{litres(eauAujourdhui)}{objectifEau ? <span className="text-base font-medium text-text-secondary"> / {litres(objectifEau)}</span> : null}</p>
          {objectifEau ? <ProgressBar className="mt-3" valeur={(eauAujourdhui / objectifEau) * 100} label="Hydratation du jour" /> : <p className="mt-2 text-xs text-text-meta">Repère indisponible sans pesée récente.</p>}
          <p className="mt-2 text-xs text-text-meta">Repère indicatif basé sur le poids enregistré.</p>
          <div className="mt-4"><HydrationControls peutAnnuler={prisesAujourdhui.length > 0} /></div>
        </Card>

        <Card aria-labelledby="titre-dernieres-seances" className="h-full">
          <div className="flex items-center justify-between gap-3"><div><CardTitle id="titre-dernieres-seances">Dernières séances</CardTitle><p className="mt-1 text-sm text-text-secondary">Activités terminées et enregistrées</p></div><Link href="/seance" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">Tout voir <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
          {historique.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{historique.slice(0, 4).map((seance) => <li key={seance.id} className="flex min-h-16 items-center justify-between gap-3 rounded-xl bg-surface-raised px-4 py-3"><div className="min-w-0"><p className="truncate font-semibold">{seance.nom}</p><p className="text-xs text-text-meta">{formaterDateCourte(jourLocal(new Date(seance.commencee_le)))}</p></div><span className="shrink-0 text-xs text-text-secondary">{seance.nombreSeries} série{seance.nombreSeries === 1 ? "" : "s"}</span></li>)}</ul> : <div className="mt-4 rounded-xl bg-surface-raised p-4"><Moon aria-hidden="true" className="size-5 text-text-meta" /><p className="mt-2 text-sm text-text-secondary">Aucune séance terminée enregistrée pour le moment.</p></div>}
        </Card>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat nom="Jours de suivi" valeur={String(stats.joursDeSuivi)} />
        <Stat nom="Pesées enregistrées" valeur={String(stats.nombrePesees)} />
        <Stat nom="Variation sur 7 jours" valeur={stats.variation7JoursKg === null ? "—" : signe(stats.variation7JoursKg)} note={stats.variation7JoursKg === null ? "Pas assez de mesures" : undefined} />
        <Stat nom="Eau moyenne / jour (7 j)" valeur={stats.moyenneEau7JoursMl === null ? "—" : litres(stats.moyenneEau7JoursMl)} note={stats.moyenneEau7JoursMl === null ? "Aucune donnée" : undefined} />
      </dl>
    </div>
  );
}

function Stat({ nom, valeur, note }: { nom: string; valeur: string; note?: string }) {
  return <div className="rounded-card border border-border bg-surface px-4 py-3"><dt className="text-xs text-text-meta">{nom}</dt><dd className="mt-1 font-display text-xl font-bold">{valeur}</dd>{note ? <dd className="text-xs text-text-meta">{note}</dd> : null}</div>;
}
