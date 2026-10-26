import { z } from "zod";

export const peseeSchema = z.object({
  poids_kg: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(String(v).replace(",", "."))),
    z
      .number({ error: "Indiquez votre poids." })
      .min(30, "Indiquez un poids entre 30 et 300 kg.")
      .max(300, "Indiquez un poids entre 30 et 300 kg."),
  ),
});

export type PeseeSaisie = z.input<typeof peseeSchema>;

/** Quantités proposées par les boutons d'hydratation. */
export const QUANTITES_EAU_ML = [250, 500] as const;

export const priseEauSchema = z.object({
  quantite_ml: z.union(QUANTITES_EAU_ML.map((q) => z.literal(q))),
});
