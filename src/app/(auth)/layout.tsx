/** Mise en page des pages d'accès : colonne centrée, sans navigation. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <p className="mb-8 font-display text-2xl font-extrabold tracking-tight text-primary">
        FITORA
      </p>
      <main className="w-full max-w-md animate-apparition rounded-card border border-border bg-surface p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
