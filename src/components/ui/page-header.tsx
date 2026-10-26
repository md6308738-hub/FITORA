type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-text lg:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-text-secondary">{description}</p>
      ) : null}
    </header>
  );
}
