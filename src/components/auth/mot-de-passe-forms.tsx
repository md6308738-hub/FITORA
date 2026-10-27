"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { changerMotDePasse, demanderReinitialisation } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import {
  emailSeulSchema,
  nouveauMotDePasseSchema,
  type EmailSeulValeurs,
  type NouveauMotDePasseValeurs,
  type ResultatAction,
} from "@/lib/validation/auth";

export function MotDePasseOublieForm() {
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<EmailSeulValeurs>({
    resolver: zodResolver(emailSeulSchema),
    mode: "onTouched",
  });

  if (resultat?.ok) return <FormMessage type="succes">{resultat.message}</FormMessage>;

  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => startTransition(async () => setResultat(await demanderReinitialisation(v))))}>
      {resultat && !resultat.ok ? <FormMessage type="erreur">{resultat.erreur}</FormMessage> : null}
      <TextField id="email" label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
      <Button type="submit" enCours={enCours} className="w-full">Recevoir le lien</Button>
      <p className="text-center text-sm text-text-secondary">
        <Link href="/connexion" className="font-semibold text-primary hover:underline">Retour à la connexion</Link>
      </p>
    </form>
  );
}

export function NouveauMotDePasseForm({ apresSucces = "/" }: { apresSucces?: string | null }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [resultat, setResultat] = useState<ResultatAction | null>(null);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<NouveauMotDePasseValeurs>({
    resolver: zodResolver(nouveauMotDePasseSchema),
    mode: "onTouched",
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit((valeurs) =>
        startTransition(async () => {
          const reponse = await changerMotDePasse(valeurs);
          setResultat(reponse);
          if (reponse.ok) {
            reset();
            if (apresSucces) router.push(apresSucces);
          } else {
            for (const [champ, message] of Object.entries(reponse.champs ?? {})) setError(champ as keyof NouveauMotDePasseValeurs, { message });
          }
        }),
      )}
    >
      {resultat ? (
        <FormMessage type={resultat.ok ? "succes" : "erreur"}>{resultat.ok ? resultat.message : resultat.erreur}</FormMessage>
      ) : null}
      <TextField id="nouveau-mot-de-passe" label="Nouveau mot de passe" type="password" autoComplete="new-password" hint="Au moins 8 caractères, dont une lettre et un chiffre." error={errors.motDePasse?.message} {...register("motDePasse")} />
      <TextField id="confirmation-mot-de-passe" label="Confirmation" type="password" autoComplete="new-password" error={errors.confirmation?.message} {...register("confirmation")} />
      <Button type="submit" enCours={enCours}>Enregistrer le mot de passe</Button>
    </form>
  );
}
