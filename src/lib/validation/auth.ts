import { z } from "zod";

const nomPropre = (champ: string) =>
  z
    .string()
    .trim()
    .min(1, `Indiquez votre ${champ}.`)
    .max(50, `Votre ${champ} ne doit pas dépasser 50 caractères.`)
    .regex(/^[\p{L}][\p{L}' -]*$/u, `Votre ${champ} contient des caractères non autorisés.`);

const email = z
  .string()
  .trim()
  .min(1, "Indiquez votre adresse email.")
  .pipe(z.email("Adresse email invalide."));

export const inscriptionSchema = z
  .object({
    prenom: nomPropre("prénom"),
    nom: nomPropre("nom"),
    email,
    motDePasse: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(72, "Le mot de passe ne doit pas dépasser 72 caractères.")
      .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre."),
    confirmation: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((valeurs) => valeurs.motDePasse === valeurs.confirmation, {
    path: ["confirmation"],
    message: "Les mots de passe ne correspondent pas.",
  });

export type InscriptionValeurs = z.infer<typeof inscriptionSchema>;

export const connexionSchema = z.object({
  email,
  motDePasse: z.string().min(1, "Indiquez votre mot de passe."),
});

export type ConnexionValeurs = z.infer<typeof connexionSchema>;

/** Résultat renvoyé par les actions serveur des formulaires. */
export type ResultatAction =
  | { ok: true; message?: string }
  | { ok: false; erreur: string; champs?: Record<string, string> };

/** Convertit les erreurs Zod en { champ: premier message }. */
export function erreursParChamp(erreur: z.ZodError): Record<string, string> {
  const champs: Record<string, string> = {};
  for (const issue of erreur.issues) {
    const cle = issue.path.join(".");
    if (cle && !(cle in champs)) {
      champs[cle] = issue.message;
    }
  }
  return champs;
}
