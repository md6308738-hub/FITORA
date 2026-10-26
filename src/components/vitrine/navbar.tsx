"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { styleBouton } from "@/components/ui/button";

export const LIENS_VITRINE = [
  { href: "#accueil", libelle: "Accueil" },
  { href: "#programmes", libelle: "Programmes" },
  { href: "#nutrition", libelle: "Nutrition" },
  { href: "#coaching", libelle: "Coaching" },
  { href: "#a-propos", libelle: "À propos" },
] as const;

export function Navbar() {
  const [ouvert, setOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const boutonMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const auDefilement = () => setDefile(window.scrollY > 24);
    auDefilement();
    window.addEventListener("scroll", auDefilement, { passive: true });
    return () => window.removeEventListener("scroll", auDefilement);
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    const auClavier = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") {
        setOuvert(false);
        boutonMenu.current?.focus();
      }
    };
    const ecranLarge = window.matchMedia("(min-width: 1024px)");
    const auRedimensionnement = () => ecranLarge.matches && setOuvert(false);
    document.addEventListener("keydown", auClavier);
    ecranLarge.addEventListener("change", auRedimensionnement);
    return () => {
      document.removeEventListener("keydown", auClavier);
      ecranLarge.removeEventListener("change", auRedimensionnement);
    };
  }, [ouvert]);

  const lien =
    "rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        defile || ouvert ? "bg-background/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav aria-label="Navigation principale" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <Link href="#accueil" className="font-display text-xl font-extrabold tracking-tight text-white lg:text-2xl">
          FITORA
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LIENS_VITRINE.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={lien}>
                {item.libelle}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/inscription" className={`${styleBouton("primaire")} rounded-full! max-sm:hidden`}>
            Commencer
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <button
            ref={boutonMenu}
            type="button"
            className="flex size-11 items-center justify-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-white lg:hidden"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOuvert((valeur) => !valeur)}
          >
            {ouvert ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </nav>

      <nav id="menu-mobile" aria-label="Menu" hidden={!ouvert} className="border-t border-white/10 px-5 pb-6 sm:px-8 lg:hidden">
        <ul className="flex flex-col py-2">
          {LIENS_VITRINE.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setOuvert(false)} className={`${lien} flex min-h-12 items-center text-base`}>
                {item.libelle}
              </a>
            </li>
          ))}
          <li>
            <Link href="/connexion" className={`${lien} flex min-h-12 items-center text-base`}>
              Se connecter
            </Link>
          </li>
        </ul>
        <Link href="/inscription" className={`${styleBouton("primaire")} w-full rounded-full!`}>
          Commencer
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </nav>
    </header>
  );
}
