import type { ComponentProps } from "react";

export type Option<V extends string = string> = {
  valeur: V;
  libelle: string;
  description?: string;
};

type ChoiceGroupProps = {
  name: string;
  legende: string;
  options: readonly Option[];
  /** "radio" : un seul choix ; "checkbox" : plusieurs. */
  type?: "radio" | "checkbox";
  error?: string;
  hint?: string;
  colonnes?: 1 | 2 | 3;
  /** Propriétés transmises à chaque case (register de React Hook Form). */
  inputProps?: Omit<ComponentProps<"input">, "type" | "value" | "id">;
};

const COLONNES = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
} as const;

/** Groupe de choix présentés en cartes, basé sur de vrais boutons radio / cases à cocher. */
export function ChoiceGroup({
  name,
  legende,
  options,
  type = "radio",
  error,
  hint,
  colonnes = 2,
  inputProps,
}: ChoiceGroupProps) {
  const aideId = hint ? `${name}-aide` : undefined;
  const erreurId = error ? `${name}-erreur` : undefined;

  return (
    <fieldset
      aria-describedby={[aideId, erreurId].filter(Boolean).join(" ") || undefined}
    >
      <legend className="mb-1.5 text-sm font-medium text-text">{legende}</legend>
      {hint ? (
        <p id={aideId} className="mb-2 text-sm text-text-meta">
          {hint}
        </p>
      ) : null}
      <div className={`grid gap-2 ${COLONNES[colonnes]}`}>
        {options.map((option) => {
          const id = `${name}-${option.valeur}`;
          return (
            <div key={option.valeur}>
              <input
                id={id}
                type={type}
                value={option.valeur}
                className="peer sr-only"
                {...inputProps}
              />
              <label
                htmlFor={id}
                className="flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-text-meta peer-checked:border-primary peer-checked:bg-primary-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
              >
                <span className="text-sm font-semibold text-text">
                  {option.libelle}
                </span>
                {option.description ? (
                  <span className="mt-0.5 text-sm text-text-secondary">
                    {option.description}
                  </span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>
      {error ? (
        <p id={erreurId} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
