"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { styleBouton } from "@/components/ui/button";
import posterMobile from "../../../public/images/hero-mobile.jpg";
import posterOrdinateur from "../../../public/images/hero-ordinateur.jpg";

/** Vraies vidéos filmées (Tima Miroshnichenko, licence Pexels — docs/credits-medias.md). */
const VIDEOS = { ordinateur: "/videos/hero-ordinateur.mp4", mobile: "/videos/hero-mobile.mp4" } as const;

/**
 * - "defilement" : la vidéo avance et recule avec le défilement (ordinateur) ;
 * - "boucle" : lecture automatique en boucle (écrans tactiles, où le défilement image par image saccade) ;
 * - "fixe" : image seule (préférence « réduire les animations »).
 */
type Mode = "defilement" | "boucle" | "fixe";
type Support = { mode: Mode; mobile: boolean };

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const cadre = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const texte = useRef<HTMLDivElement>(null);
  const titreSalle = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useState<Support | null>(null);
  const [videoPrete, setVideoPrete] = useState(false);

  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tactile = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const mode: Mode = reduit ? "fixe" : tactile || mobile ? "boucle" : "defilement";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capacités connues seulement dans le navigateur
    setSupport({ mode, mobile });
  }, []);

  // Défilement → avance de la vidéo et léger travelling, disparition du titre, chapitre « salle ».
  useEffect(() => {
    if (!section.current || !support || support.mode === "fixe") return;
    gsap.registerPlugin(ScrollTrigger);
    const contexte = gsap.context(() => {
      const declencheur = { trigger: section.current, start: "top top", end: "bottom bottom" };
      if (support.mode === "defilement") {
        ScrollTrigger.create({
          ...declencheur,
          onUpdate: ({ progress }) => {
            const element = video.current;
            if (!element || !Number.isFinite(element.duration)) return;
            gsap.to(element, { currentTime: progress * (element.duration - 0.1), duration: 0.35, ease: "power1.out", overwrite: true });
          },
        });
      }
      gsap
        .timeline({ scrollTrigger: { ...declencheur, scrub: 0.6 } })
        .fromTo(cadre.current, { scale: 1.08 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .to(texte.current, { autoAlpha: 0, y: -40, ease: "none", duration: 0.18 }, 0.04)
        .fromTo(titreSalle.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "none", duration: 0.12 }, 0.84);
    }, section);
    return () => contexte.revert();
  }, [support]);

  const poster = support?.mobile ? posterMobile : posterOrdinateur;

  return (
    <section
      id="accueil"
      ref={section}
      aria-labelledby="titre-hero"
      className={support?.mode === "fixe" ? "relative" : "relative h-[320vh]"}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Arrière-plan : vraie vidéo filmée, image fixe pendant le chargement ou en mode réduit */}
        <div ref={cadre} className="absolute inset-0 will-change-transform">
          <Image
            src={poster}
            alt="Athlète réalisant un curl avec des haltères dans une salle de sport"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
          {support && support.mode !== "fixe" ? (
            <video
              ref={video}
              key={support.mobile ? "mobile" : "ordinateur"}
              src={support.mobile ? VIDEOS.mobile : VIDEOS.ordinateur}
              muted
              playsInline
              preload="auto"
              autoPlay={support.mode === "boucle"}
              loop={support.mode === "boucle"}
              aria-hidden="true"
              tabIndex={-1}
              onCanPlay={() => setVideoPrete(true)}
              className={`absolute inset-0 size-full object-cover object-[60%_center] transition-opacity duration-700 ${
                videoPrete ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : null}
          {/* Voile de lisibilité côté texte uniquement */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-background/90 via-background/30 to-background/40 lg:bg-linear-to-r lg:from-background/85 lg:via-background/25 lg:to-transparent"
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pt-24 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-8 lg:justify-center lg:px-12 lg:pt-20 lg:pb-0">
          <div ref={texte} className="mt-auto max-w-xl lg:mt-0">
            <p className="animate-apparition text-xs font-semibold tracking-[0.22em] text-accent-clair sm:text-sm">
              TA FORCE. TON RYTHME. TON ÉVOLUTION.
            </p>
            <h1
              id="titre-hero"
              className="mt-4 animate-apparition font-display text-5xl leading-[0.92] font-extrabold tracking-tight uppercase [animation-delay:120ms] sm:text-7xl lg:text-8xl"
            >
              Atteins tes{" "}
              <span className="block text-accent">objectifs</span>
            </h1>
            <p className="mt-5 max-w-md animate-apparition text-base text-text-secondary [animation-delay:220ms] sm:text-lg">
              Entraînement, nutrition et coaching pour révéler ton potentiel.
            </p>
            <Link
              href="/inscription"
              className={`${styleBouton("primaire")} mt-8 min-h-12 animate-apparition rounded-full! px-7 text-base [animation-delay:320ms] focus-visible:outline-white`}
            >
              Commencer maintenant
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          {/* Chapitre « la salle », révélé à la fin du défilement */}
          <div
            ref={titreSalle}
            id="salle"
            className={`absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+2.5rem)] left-5 max-w-lg sm:left-8 lg:left-12 ${
              support?.mode === "fixe" ? "hidden" : "invisible opacity-0"
            }`}
          >
            <h2 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
              Ta salle, <span className="text-accent">ton terrain</span>
            </h2>
            <p className="mt-3 text-text-secondary">
              Des séances pensées pour le matériel dont tu disposes : salle, maison ou poids du corps.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
