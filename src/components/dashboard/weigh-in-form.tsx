"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { enregistrerPesee } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { peseeSchema, type PeseeSaisie } from "@/lib/validation/suivi";

/** Saisie de la pesée du jour (remplace celle déjà saisie aujourd'hui). */
export function WeighInForm({ dejaPeseAujourdhui }: { dejaPeseAujourdhui: boolean }) {
  const [enCours, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PeseeSaisie>({
    resolver: zodResolver(peseeSchema) as Resolver<PeseeSaisie>,
    defaultValues: { poids_kg: "" },
  });

  const onSubmit = (valeurs: PeseeSaisie) => {
    setMessage(null);
    startTransition(async () => {
      const reponse = await enregistrerPesee(valeurs);
      if (reponse.ok) {
        reset({ poids_kg: "" });
        setMessage({ ok: true, texte: reponse.message ?? "Enregistré." });
      } else {
        setMessage({ ok: false, texte: reponse.erreur });
        if (reponse.champs?.poids_kg) setError("poids_kg", { message: reponse.champs.poids_kg });
      }
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
      <TextField
        id="pesee"
        label={dejaPeseAujourdhui ? "Corriger la pesée du jour" : "Pesée du jour"}
        inputMode="decimal"
        suffixe="kg"
        placeholder="72,5"
        className="flex-1"
        error={typeof errors.poids_kg?.message === "string" ? errors.poids_kg.message : undefined}
        {...register("poids_kg")}
      />
      <Button type="submit" enCours={enCours} className="sm:mt-7">
        Enregistrer
      </Button>
      {message ? (
        <p role="status" className={`text-sm sm:basis-full ${message.ok ? "text-primary" : "text-error"}`}>
          {message.texte}
        </p>
      ) : null}
    </form>
  );
}
