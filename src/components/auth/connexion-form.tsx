"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { connecter } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { connexionSchema, type ConnexionValeurs } from "@/lib/validation/auth";

export function ConnexionForm() {
  const lienInvalide = useSearchParams().get("erreur") === "lien-invalide";
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ConnexionValeurs>({
    resolver: zodResolver(connexionSchema),
    mode: "onTouched",
  });

  const onSubmit = (valeurs: ConnexionValeurs) => {
    setErreur(null);
    startTransition(async () => {
      // En cas de succès, l'action redirige vers l'accueil.
      const reponse = await connecter(valeurs);
      if (!reponse.ok) {
        setErreur(reponse.erreur);
        for (const [champ, message] of Object.entries(reponse.champs ?? {})) {
          setError(champ as keyof ConnexionValeurs, { message });
        }
      }
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {lienInvalide && !erreur ? (
        <FormMessage type="erreur">
          Ce lien de confirmation est invalide ou a expiré. Connectez-vous ou
          recommencez l’inscription.
        </FormMessage>
      ) : null}
      {erreur ? <FormMessage type="erreur">{erreur}</FormMessage> : null}
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
        autoComplete="current-password"
        error={errors.motDePasse?.message}
        {...register("motDePasse")}
      />
      <Button type="submit" enCours={enCours} className="w-full">
        Se connecter
      </Button>
      <p className="text-center text-sm text-text-secondary">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
