import { BottomNav } from "@/components/navigation/bottom-nav";
import { MobileHeader } from "@/components/navigation/mobile-header";
import { Sidebar } from "@/components/navigation/sidebar";

/** Mise en page de l'espace connecté : barre latérale (ordinateur), en-tête et barre du bas (mobile). */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <MobileHeader />
      <div className="lg:pl-56">
        <main className="w-full px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
