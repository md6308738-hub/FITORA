"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { ChoiceGroup } from "@/components/ui/choice-group";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import type { EtapeId } from "@/lib/onboarding/etapes";
import {
  OPTIONS_ACTIVITE,
  OPTIONS_BUDGET,
  OPTIONS_DUREE,
  OPTIONS_JOURS,
  OPTIONS_MATERIEL,
  OPTIONS_NIVEAU,
  OPTIONS_NIVEAU_ACTIVITE,
  OPTIONS_OBJECTIF,
  OPTIONS_RESTRICTION,
  OPTIONS_SEXE,
} from "@/lib/onboarding/options";

export type ValeursEtape = Record<string, unknown>;

type EtapeChampsProps = {
  id: EtapeId;
  register: UseFormRegister<ValeursEtape>;
  errors: FieldErrors<ValeursEtape>;
};

/** Champs d'une étape du questionnaire. */
export function EtapeChamps({ id, register, errors }: EtapeChampsProps) {
  const erreur = (nom: string) => {
    const message = errors[nom]?.message;
    return typeof message === "string" ? message : undefined;
  };
  const choix = (nom: string) => ({ name: nom, error: erreur(nom), inputProps: register(nom) });

  switch (id) {
    case "mensurations":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField id="age" label="Âge" inputMode="numeric" suffixe="ans" error={erreur("age")} {...register("age")} />
            <TextField id="taille_cm" label="Taille" inputMode="numeric" suffixe="cm" error={erreur("taille_cm")} {...register("taille_cm")} />
            <TextField id="poids_kg" label="Poids actuel" inputMode="decimal" suffixe="kg" error={erreur("poids_kg")} {...register("poids_kg")} />
          </div>
          <ChoiceGroup
            legende="Sexe (facultatif)"
            hint="Il affine l’estimation de vos besoins caloriques."
            options={OPTIONS_SEXE}
            colonnes={3}
            {...choix("sexe")}
          />
        </>
      );
    case "objectif":
      return (
        <>
          <ChoiceGroup legende="Objectif principal" options={OPTIONS_OBJECTIF} {...choix("objectif")} />
          <TextField
            id="poids_objectif_kg"
            label="Poids objectif (facultatif)"
            inputMode="decimal"
            suffixe="kg"
            className="sm:max-w-xs"
            error={erreur("poids_objectif_kg")}
            {...register("poids_objectif_kg")}
          />
        </>
      );
    case "niveau":
      return <ChoiceGroup legende="Niveau sportif" options={OPTIONS_NIVEAU} colonnes={1} {...choix("niveau")} />;
    case "activites":
      return <ChoiceGroup legende="Activités pratiquées" type="checkbox" options={OPTIONS_ACTIVITE} {...choix("activites")} />;
    case "disponibilites":
      return (
        <>
          <ChoiceGroup legende="Jours disponibles par semaine" options={OPTIONS_JOURS} colonnes={3} {...choix("jours_par_semaine")} />
          <ChoiceGroup legende="Durée souhaitée par séance" options={OPTIONS_DUREE} colonnes={3} {...choix("duree_seance_min")} />
        </>
      );
    case "materiel":
      return <ChoiceGroup legende="Matériel disponible" options={OPTIONS_MATERIEL} colonnes={1} {...choix("materiel")} />;
    case "experience":
      return (
        <>
          <TextAreaField
            id="experience"
            label="Expérience sportive"
            placeholder="Ex. : football en club pendant 5 ans, musculation depuis 1 an…"
            error={erreur("experience")}
            {...register("experience")}
          />
          <TextAreaField
            id="exercices_preferes"
            label="Exercices préférés"
            placeholder="Ex. : squat, tractions, course à pied…"
            error={erreur("exercices_preferes")}
            {...register("exercices_preferes")}
          />
        </>
      );
    case "alimentation":
      return (
        <>
          <ChoiceGroup legende="Restrictions alimentaires" type="checkbox" options={OPTIONS_RESTRICTION} colonnes={3} {...choix("restrictions_alimentaires")} />
          <TextField id="allergies" label="Allergies" placeholder="Ex. : arachides" error={erreur("allergies")} {...register("allergies")} />
          <ChoiceGroup legende="Budget alimentaire" options={OPTIONS_BUDGET} colonnes={3} {...choix("budget_alimentaire")} />
          <TextAreaField
            id="aliments_preferes"
            label="Aliments préférés"
            placeholder="Ex. : thiéboudienne, poulet yassa, mangue…"
            error={erreur("aliments_preferes")}
            {...register("aliments_preferes")}
          />
        </>
      );
    case "mode-de-vie":
      return (
        <>
          <TextField
            id="sommeil_heures"
            label="Sommeil moyen par nuit (facultatif)"
            inputMode="decimal"
            suffixe="h"
            className="sm:max-w-xs"
            error={erreur("sommeil_heures")}
            {...register("sommeil_heures")}
          />
          <ChoiceGroup legende="Activité quotidienne (hors sport)" options={OPTIONS_NIVEAU_ACTIVITE} colonnes={1} {...choix("niveau_activite")} />
          <TextAreaField
            id="blessures"
            label="Blessures ou limitations physiques (facultatif)"
            hint="Ces informations restent privées. En cas de douleur, demandez l’avis d’un professionnel de santé."
            error={erreur("blessures")}
            {...register("blessures")}
          />
        </>
      );
  }
}
