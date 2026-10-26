"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { styleBouton } from "@/components/ui/button";
import banniere from "../../../public/images/banniere-athlete.jpg";

import type { EtatScene } from "./scene/athlete";
import { detecterQualite, webglDisponible, type Qualite } from "./scene/config";
import { SceneBoundary } from "./scene/scene-boundary";

// Three.js n'est chargé que côté navigateur, après le premier affichage du texte.
const FitnessScene = dynamic(() => import("./scene/fitness-scene"), { ssr: false });

type Support = { webgl: boolean; qualite: Qualite; reduit: boolean };

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const texte = useRef<HTMLDivElement>(null);
  const titreSalle = useRef<HTMLDivElement>(null);
  const etat = useRef<EtatScene>({ progression: 0 });
  const [support, setSupport] = useState<Support | null>(null);
  const [visible, setVisible] = useState(true);
  const [prete, setPrete] = useState(false);
  const onPrete = useCallback(() => setPrete(true), []);
  const onErreurScene = useCallback(
    () => setSupport((actuel) => (actuel ? { ...actuel, webgl: false } : actuel)),
    [],
  );

  // Détection côté navigateur : WebGL, puissance de l'appareil, réduction des animations.
  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capacités connues seulement dans le navigateur
    setSupport({ webgl: webglDisponible(), qualite: detecterQualite(), reduit });
  }, []);

  // Le rendu 3D est suspendu quand la section n'est plus à l'écran.
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observateur = new IntersectionObserver(([entree]) => setVisible(Boolean(entree?.isIntersecting)));
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  // Défilement → progression de la caméra, disparition du titre, apparition du chapitre « salle ».
  useEffect(() => {
    if (!section.current || !support) return;
    gsap.registerPlugin(ScrollTrigger);
    const contexte = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (instance) => {
          etat.current.progression = instance.progress;
        },
      });
      if (support.reduit) return;
      gsap
        .timeline({ scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6 } })
        .to(texte.current, { autoAlpha: 0, y: -40, ease: "none", duration: 0.18 }, 0.04)
        .fromTo(titreSalle.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "none", duration: 0.12 }, 0.84);
    }, section);
    return () => contexte.revert();
  }, [support]);

  const scene3d = support?.webgl === true;

  return (
    <section
      id="accueil"
      ref={section}
      aria-labelledby="titre-hero"
      className={support?.reduit ? "relative" : "relative h-[320vh]"}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Arrière-plan : scène 3D, ou photo si WebGL est indisponible */}
        <div className="absolute inset-0">
          {scene3d && support ? (
            <SceneBoundary onErreur={onErreurScene}>
              <FitnessScene
                etat={etat}
                qualite={support.qualite}
                anime={!support.reduit}
                visible={visible}
                onPrete={onPrete}
              />
            </SceneBoundary>
          ) : null}
          {support && !scene3d ? (
            <Image
              src={banniere}
              alt="Athlète travaillant les biceps avec un haltère dans une salle de sport"
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              className="object-cover object-[42%_center]"
            />
          ) : null}
          {/* Fondu d'entrée : la salle se révèle quand ses ressources sont prêtes */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-background transition-opacity duration-[1600ms] ease-out ${
              prete || (support && !scene3d) ? "opacity-0" : "opacity-100"
            }`}
          />
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
            {scene3d && !prete ? (
              <p role="status" className="mt-6 text-xs tracking-[0.2em] text-white/50 uppercase">
                Chargement de la salle…
              </p>
            ) : null}
          </div>

          {/* Chapitre « la salle », révélé à la fin du travelling */}
          <div
            ref={titreSalle}
            id="salle"
            className={`absolute right-5 bottom-[calc(env(safe-area-inset-bottom)+2.5rem)] left-5 max-w-lg sm:left-8 lg:left-12 ${
              support?.reduit ? "hidden" : "invisible opacity-0"
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
