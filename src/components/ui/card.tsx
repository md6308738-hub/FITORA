import type { ComponentProps } from "react";

/** Carte de base : fond surélevé, bordure fine, sans ombre lourde. */
export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section
      className={`animate-apparition rounded-card border border-border bg-surface p-5 lg:p-6 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      className={`text-sm font-semibold tracking-wide text-text-secondary uppercase ${className}`}
      {...props}
    />
  );
}
