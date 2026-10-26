type EmptyStateProps = {
  title: string;
  description: string;
};

/** État « liste vide » : carte sobre, sans action tant qu'aucune n'est disponible. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-card border border-border bg-surface p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 max-w-prose text-text-secondary">{description}</p>
    </section>
  );
}
