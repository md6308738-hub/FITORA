import { BottomNav } from "@/components/navigation/bottom-nav";
import { MobileHeader } from "@/components/navigation/mobile-header";
import { Sidebar } from "@/components/navigation/sidebar";

/** Mise en page de l'espace connecté : barre latérale (ordinateur), en-tête et barre du bas (mobile). */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <MobileHeader />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
