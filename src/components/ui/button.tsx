import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";

type Variante = "primaire" | "secondaire" | "discret";

const STYLES: Record<Variante, string> = {
  primaire:
    "bg-primary text-on-primary hover:bg-primary-hover disabled:bg-primary/50",
  secondaire:
    "border border-border bg-surface-raised text-text hover:border-text-meta disabled:text-text-meta",
  discret: "text-text-secondary hover:bg-surface-raised hover:text-text",
};

export const BASE_BOUTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed";

export function styleBouton(variante: Variante = "primaire"): string {
  return `${BASE_BOUTON} ${STYLES[variante]}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variante?: Variante;
  /** Affiche un indicateur et désactive le bouton pendant une action. */
  enCours?: boolean;
};

export function Button({
  variante = "primaire",
  enCours = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || enCours}
      aria-busy={enCours || undefined}
      className={`${styleBouton(variante)} ${className}`}
      {...props}
    >
      {enCours ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
