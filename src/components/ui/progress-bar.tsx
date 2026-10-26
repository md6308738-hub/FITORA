type ProgressBarProps = {
  /** Valeur entre 0 et 100. */
  valeur: number;
  label: string;
  className?: string;
};

export function ProgressBar({ valeur, label, className = "" }: ProgressBarProps) {
  const borne = Math.min(100, Math.max(0, Math.round(valeur)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={borne}
      className={`h-2 w-full overflow-hidden rounded-full bg-surface-raised ${className}`}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${borne}%` }}
      />
    </div>
  );
}
