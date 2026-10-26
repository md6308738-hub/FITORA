import {
  ChartLine,
  CircleUserRound,
  Dumbbell,
  House,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Entrées principales, communes à la barre latérale et à la barre du bas. */
export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/programmes", label: "Programmes", icon: Dumbbell },
  { href: "/seance", label: "Séance", icon: Timer },
  { href: "/progression", label: "Progrès", icon: ChartLine },
  { href: "/objectifs", label: "Objectifs", icon: Target },
];

export const PROFILE_NAV_ITEM: NavItem = {
  href: "/profil",
  label: "Profil",
  icon: CircleUserRound,
};

/** Une entrée est active sur sa propre page et sur ses sous-pages ; l'accueil uniquement sur « / ». */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
