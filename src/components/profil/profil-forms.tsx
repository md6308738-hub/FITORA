"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { modifierSectionProfil } from "@/app/onboarding/actions";
import {
  donnerConsentementSante,
  modifierIdentite,
  retirerConsentementSante,
  supprimerCompte,
} from "@/app/(app)/profil/actions";
import { EtapeChamps, type ValeursEtape } from "@/components/onboarding/etape-champs";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { ETAPES, type EtapeId } from "@/lib/onboarding/etapes";
import {
  identiteSchema,
  suppressionCompteSchema,
  type IdentiteValeurs,
  type ResultatAction,
  type SuppressionCompteValeurs,
} from "@/lib/validation/auth";

function Message({ resultat }: { resultat: ResultatAction | null }) {
  if (!resultat) return null;
  return <FormMessage type={resultat.ok ? "succes" : "erreur"}>{resultat.ok ? (resultat.message ?? "Enregistré.") : resultat.erreur}</FormMessage>;
}

export function IdentiteForm({ valeurs }: { valeurs: IdentiteValeurs }) {
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<IdentiteValeurs>({
    resolver: zodResolver(identiteSchema),
    defaultValues: valeurs,
  });
  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => startTransition(async () => setResultat(await modifierIdentite(v))))}>
      <Message resultat={resultat} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="profil-prenom" label="Prénom" autoComplete="given-name" error={errors.prenom?.message} {...register("prenom")} />
        <TextField id="profil-nom" label="Nom" autoComplete="family-name" error={errors.nom?.message} {...register("nom")} />
      </div>
      <Button type="submit" enCours={enCours}>Enregistrer</Button>
    </form>
  );
}

function SectionForm({ index, valeurs }: { index: number; valeurs: ValeursEtape }) {
  const etape = ETAPES[index] ?? ETAPES[0];
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ValeursEtape>({
    resolver: zodResolver(etape.schema) as unknown as Resolver<ValeursEtape>,
    defaultValues: valeurs,
    mode: "onTouched",
  });
  return (
    <form
      noValidate
      className="space-y-6 pt-4"
      onSubmit={handleSubmit((saisies) =>
        startTransition(async () => {
          const reponse = await modifierSectionProfil(index, saisies);
          setResultat(reponse);
          if (!reponse.ok) for (const [champ, message] of Object.entries(reponse.champs ?? {})) setError(champ, { message });
        }),
      )}
    >
      <Message resultat={resultat} />
      <EtapeChamps id={etape.id} register={register} errors={errors} />
      <Button type="submit" enCours={enCours}>Enregistrer cette section</Button>
    </form>
  );
}

/** Réponses du questionnaire, modifiables section par section. */
export function SectionsProfil({ valeurs }: { valeurs: Record<EtapeId, ValeursEtape> }) {
  const [ouverte, setOuverte] = useState<number | null>(null);
  return (
    <ul className="divide-y divide-border rounded-card border border-border bg-surface">
      {ETAPES.map((etape, index) => (
        <li key={etape.id} className="px-5">
          <button
            type="button"
            aria-expanded={ouverte === index}
            aria-controls={`section-${etape.id}`}
            onClick={() => setOuverte(ouverte === index ? null : index)}
            className="flex min-h-14 w-full items-center justify-between gap-3 text-left font-medium focus-visible:outline-2 focus-visible:outline-primary"
          >
            {etape.titre}
            <ChevronDown aria-hidden="true" className={`size-5 text-text-meta transition-transform ${ouverte === index ? "rotate-180" : ""}`} />
          </button>
          <div id={`section-${etape.id}`} hidden={ouverte !== index} className="pb-5">
            {ouverte === index ? <SectionForm index={index} valeurs={valeurs[etape.id]} /> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ConsentementSante({ donneLe }: { donneLe: string | null }) {
  const [enCours, startTransition] = useTransition();
  const [confirmerRetrait, setConfirmerRetrait] = useState(false);
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const executer = (action: () => Promise<ResultatAction>) =>
    startTransition(async () => {
      const reponse = await action();
      setResultat(reponse.ok ? null : reponse);
      setConfirmerRetrait(false);
    });

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-text-secondary">
        <p><strong className="text-text">Données concernées :</strong> sommeil, fatigue, douleurs, pas, blessures et limitations physiques.</p>
        <p><strong className="text-text">Pourquoi :</strong> adapter tes séances et suivre ta récupération. Aucun diagnostic médical n’est établi.</p>
        <p><strong className="text-text">Qui y accède :</strong> toi seul. Elles ne sont jamais partagées ni publiées.</p>
        <p><strong className="text-text">Retrait :</strong> à tout moment ; ces données sont alors effacées. Tu peux aussi les exporter avant.</p>
      </div>
      <Message resultat={resultat} />
      {donneLe ? (
        <div className="space-y-3">
          <p className="text-sm">
            Consentement donné le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Dakar" }).format(new Date(donneLe))}.
          </p>
          {confirmerRetrait ? (
            <div role="group" aria-label="Confirmer le retrait" className="flex flex-wrap items-center gap-2 text-sm">
              <span>Tes données de santé seront effacées. Continuer ?</span>
              <Button variante="secondaire" enCours={enCours} onClick={() => executer(retirerConsentementSante)}>Oui, retirer</Button>
              <Button variante="discret" disabled={enCours} onClick={() => setConfirmerRetrait(false)}>Annuler</Button>
            </div>
          ) : (
            <Button variante="secondaire" onClick={() => setConfirmerRetrait(true)}>Retirer mon consentement</Button>
          )}
        </div>
      ) : (
        <Button enCours={enCours} onClick={() => executer(donnerConsentementSante)}>J’accepte le suivi de mes données de santé</Button>
      )}
    </div>
  );
}

export function SuppressionCompte() {
  const [ouvert, setOuvert] = useState(false);
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<SuppressionCompteValeurs>({
    resolver: zodResolver(suppressionCompteSchema),
  });
  if (!ouvert) {
    return (
      <Button variante="secondaire" className="border-error/50 text-error" onClick={() => setOuvert(true)}>
        Supprimer mon compte
      </Button>
    );
  }
  return (
    <form
      noValidate
      className="space-y-4 rounded-xl border border-error/40 p-4"
      onSubmit={handleSubmit((v) =>
        startTransition(async () => {
          // En cas de succès, l'action redirige vers l'accueil.
          const reponse = await supprimerCompte(v);
          setResultat(reponse);
          if (!reponse.ok) for (const [champ, message] of Object.entries(reponse.champs ?? {})) setError(champ as keyof SuppressionCompteValeurs, { message });
        }),
      )}
    >
      <p className="text-sm">
        Cette action est <strong>définitive</strong> : ton compte et toutes tes données (profil, séances, mesures, repas, santé) seront effacés.
      </p>
      <Message resultat={resultat} />
      <TextField id="suppression-mot-de-passe" label="Mot de passe" type="password" autoComplete="current-password" error={errors.motDePasse?.message} {...register("motDePasse")} />
      <TextField id="suppression-confirmation" label="Écris SUPPRIMER pour confirmer" autoComplete="off" error={errors.confirmation?.message} {...register("confirmation")} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" enCours={enCours} className="bg-error text-white hover:bg-error/90">Supprimer définitivement</Button>
        <Button variante="discret" disabled={enCours} onClick={() => setOuvert(false)}>Annuler</Button>
      </div>
    </form>
  );
}
