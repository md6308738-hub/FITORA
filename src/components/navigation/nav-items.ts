import {
  Apple,
  ChartLine,
  CircleUserRound,
  Dumbbell,
  HeartPulse,
  House,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Autres pages rattachées à cette entrée (état actif). */
  autres?: readonly string[];
};

/** Entrées principales (cahier des charges § 5.1), communes à la barre latérale et à la barre du bas. */
export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/programmes", label: "Entraînement", icon: Dumbbell, autres: ["/seance"] },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/progression", label: "Progrès", icon: ChartLine },
  { href: "/sante", label: "Santé", icon: HeartPulse },
];

export const PROFILE_NAV_ITEM: NavItem = {
  href: "/profil",
  label: "Profil",
  icon: CircleUserRound,
};

/** Une entrée est active sur sa propre page et sur ses sous-pages ; l'accueil uniquement sur « / ». */
export function isNavItemActive(pathname: string, href: string, autres: readonly string[] = []): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return [href, ...autres].some((chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`));
}
