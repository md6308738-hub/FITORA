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
  const [sectionActive, setSectionActive] = useState("#accueil");
  const boutonMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = LIENS_VITRINE.map(({ href }) => document.querySelector<HTMLElement>(href)).filter((section) => section !== null);
    const observateur = new IntersectionObserver(
      (entrees) => {
        const visible = entrees
          .filter((entree) => entree.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSectionActive(`#${visible.target.id}`);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.6] },
    );
    sections.forEach((section) => observateur.observe(section));
    return () => observateur.disconnect();
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
    "rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#050a12]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <nav aria-label="Navigation principale" className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[4.5rem] lg:px-12">
        <Link href="#accueil" className="font-display text-xl font-extrabold tracking-tight text-white lg:text-2xl">
          FITORA
        </Link>

        <ul className="hidden items-center gap-2 lg:flex">
          {LIENS_VITRINE.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={sectionActive === item.href ? "location" : undefined}
                className={`${lien} relative inline-flex min-h-11 items-center ${sectionActive === item.href ? "text-accent-clair after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:bg-primary" : ""}`}
              >
                {item.libelle}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/inscription" className={`${styleBouton("primaire")} min-h-11 rounded-full! px-6`}>
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

      <nav id="menu-mobile" aria-label="Menu" hidden={!ouvert} className="border-t border-white/10 bg-[#050a12] px-5 pb-6 sm:px-8 lg:hidden">
        <ul className="flex flex-col py-2">
          {LIENS_VITRINE.map((item) => (
            <li key={item.href}>
              <a href={item.href} aria-current={sectionActive === item.href ? "location" : undefined} onClick={() => setOuvert(false)} className={`${lien} flex min-h-12 items-center text-base`}>
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
