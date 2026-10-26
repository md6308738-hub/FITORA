"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { inscrire } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import {
  inscriptionSchema,
  type InscriptionValeurs,
  type ResultatAction,
} from "@/lib/validation/auth";

export function InscriptionForm() {
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<InscriptionValeurs>({
    resolver: zodResolver(inscriptionSchema),
    mode: "onTouched",
  });

  const onSubmit = (valeurs: InscriptionValeurs) => {
    setResultat(null);
    startTransition(async () => {
      const reponse = await inscrire(valeurs);
      setResultat(reponse);
      if (!reponse.ok && reponse.champs) {
        for (const [champ, message] of Object.entries(reponse.champs)) {
          setError(champ as keyof InscriptionValeurs, { message });
        }
      }
    });
  };

  if (resultat?.ok) {
    return (
      <div className="space-y-4">
        <FormMessage type="succes">{resultat.message}</FormMessage>
        <p className="text-sm text-text-secondary">
          Déjà confirmé ?{" "}
          <Link href="/connexion" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {resultat && !resultat.ok ? (
        <FormMessage type="erreur">{resultat.erreur}</FormMessage>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="prenom"
          label="Prénom"
          autoComplete="given-name"
          error={errors.prenom?.message}
          {...register("prenom")}
        />
        <TextField
          id="nom"
          label="Nom"
          autoComplete="family-name"
          error={errors.nom?.message}
          {...register("nom")}
        />
      </div>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="motDePasse"
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        hint="Au moins 8 caractères, dont une lettre et un chiffre."
        error={errors.motDePasse?.message}
        {...register("motDePasse")}
      />
      <TextField
        id="confirmation"
        label="Confirmation du mot de passe"
        type="password"
        autoComplete="new-password"
        error={errors.confirmation?.message}
        {...register("confirmation")}
      />
      <Button type="submit" enCours={enCours} className="w-full">
        Créer mon compte
      </Button>
      <p className="text-center text-sm text-text-secondary">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
