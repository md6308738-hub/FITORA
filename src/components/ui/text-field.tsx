import type { ComponentProps } from "react";

const BASE_CHAMP =
  "w-full rounded-xl border bg-surface-raised px-4 text-base text-text placeholder:text-text-meta transition-colors focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

type CommonProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Unité affichée à droite du champ (kg, cm…). */
  suffixe?: string;
};

function describedBy(id: string, error?: string, hint?: string) {
  const ids = [hint ? `${id}-aide` : null, error ? `${id}-erreur` : null];
  return ids.filter(Boolean).join(" ") || undefined;
}

function Libelle({ id, label }: { id: string; label: string }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
      {label}
    </label>
  );
}

function Messages({ id, error, hint }: Omit<CommonProps, "label">) {
  return (
    <>
      {hint ? (
        <p id={`${id}-aide`} className="mt-1.5 text-sm text-text-meta">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-erreur`} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : null}
    </>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  suffixe,
  className = "",
  ...props
}: CommonProps & Omit<ComponentProps<"input">, "id">) {
  return (
    <div className={className}>
      <Libelle id={id} label={label} />
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${BASE_CHAMP} min-h-12 ${suffixe ? "pr-12" : ""} ${
            error ? "border-error" : "border-border"
          }`}
          {...props}
        />
        {suffixe ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-text-meta"
          >
            {suffixe}
          </span>
        ) : null}
      </div>
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  className = "",
  ...props
}: Omit<CommonProps, "suffixe"> & Omit<ComponentProps<"textarea">, "id">) {
  return (
    <div className={className}>
      <Libelle id={id} label={label} />
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${BASE_CHAMP} min-h-24 resize-y py-3 ${
          error ? "border-error" : "border-border"
        }`}
        {...props}
      />
      <Messages id={id} error={error} hint={hint} />
    </div>
  );
}
