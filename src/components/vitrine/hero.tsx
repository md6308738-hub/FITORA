"use client";

import { Activity, Apple, ArrowRight, ChartNoAxesColumnIncreasing, Dumbbell, Play, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { styleBouton } from "@/components/ui/button";
import posterMobile from "../../../public/images/hero-mobile.jpg";
import posterOrdinateur from "../../../public/images/hero-ordinateur.jpg";

const VIDEOS = { ordinateur: "/videos/hero-ordinateur.mp4", mobile: "/videos/hero-mobile.mp4" } as const;

const ATOUTS = [
  { titre: "Programmes personnalisés", texte: "Des entraînements adaptés à ton objectif", icone: Dumbbell },
  { titre: "Plans nutritionnels", texte: "Des repères simples, selon ton profil", icone: Apple },
  { titre: "Suivi de progression", texte: "Des statistiques à partir de tes données", icone: ChartNoAxesColumnIncreasing },
  { titre: "Accompagnement", texte: "Des outils pour avancer à ton rythme", icone: UserRound },
];

export function Hero() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [videoMobile, setVideoMobile] = useState(false);
  const [videoOuverte, setVideoOuverte] = useState(false);
  const [lectureAutomatique, setLectureAutomatique] = useState(false);
  const poster = videoMobile ? posterMobile : posterOrdinateur;
  const video = videoMobile ? VIDEOS.mobile : VIDEOS.ordinateur;

  const ouvrirVideo = () => {
    setVideoMobile(window.matchMedia("(max-width: 767px)").matches);
    setLectureAutomatique(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    dialog.current?.showModal();
    setVideoOuverte(true);
  };

  const fermerVideo = () => dialog.current?.close();

  return (
    <section id="accueil" aria-labelledby="titre-hero" className="bg-[#050a12] text-white">
      <div className="mx-auto flex min-h-[min(760px,100svh)] max-w-7xl flex-col justify-center px-5 pt-24 pb-7 sm:px-8 lg:px-12 lg:pt-28">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
          <div className="max-w-3xl">
            <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent/35 bg-primary/25 px-4 text-xs font-semibold tracking-wide text-white/90">
              <Activity aria-hidden="true" className="size-4 text-accent-clair" />
              TON PARTENAIRE FITNESS
            </p>
            <h1 id="titre-hero" className="mt-5 font-display text-4xl leading-[0.94] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-6xl xl:text-7xl">
              Une meilleure <span className="block"><span className="text-accent-clair">version</span> de toi</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Programmes d’entraînement, repères nutritionnels et suivi pour progresser à ton rythme.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/inscription" className={`${styleBouton("primaire")} min-h-12 rounded-full! px-7 text-base`}>
                Commencer maintenant <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <button
                type="button"
                onClick={ouvrirVideo}
                className="inline-flex min-h-12 items-center gap-3 rounded-full px-2 text-left text-sm font-semibold text-white hover:text-accent-clair focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="flex size-11 items-center justify-center rounded-full border-2 border-primary text-accent-clair"><Play aria-hidden="true" className="ml-0.5 size-4 fill-current" /></span>
                <span>Voir la vidéo<span className="mt-0.5 block text-xs font-normal text-white/65">Découvre FITORA</span></span>
              </button>
            </div>
          </div>

          <figure className="relative order-first h-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1320] sm:h-80 lg:order-none lg:h-[min(62svh,520px)]">
            <Image
              src={poster}
              alt="Athlète réalisant un exercice de musculation avec des haltères dans une salle"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-center"
            />
            <figcaption className="sr-only">Photographie de musculation affichée au premier plan.</figcaption>
          </figure>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ATOUTS.map(({ titre, texte, icone: Icone }) => (
            <li key={titre} className="flex min-h-24 items-center gap-4 rounded-2xl border border-white/10 bg-[#07111f] p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/40 text-accent-clair"><Icone aria-hidden="true" className="size-5" /></span>
              <span><span className="block text-sm font-bold">{titre}</span><span className="mt-1 block text-xs leading-relaxed text-white/65">{texte}</span></span>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        aria-label="Vidéo de présentation FITORA"
        onClick={(event) => { if (event.target === dialog.current) fermerVideo(); }}
        onClose={() => { setVideoMobile(false); setVideoOuverte(false); }}
        className="m-auto w-[min(92vw,960px)] max-w-none rounded-2xl border border-white/15 bg-[#050a12] p-3 text-white backdrop:bg-black/80"
      >
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <p className="font-display font-bold">Découvre FITORA</p>
          <button type="button" onClick={fermerVideo} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">Fermer</button>
        </div>
        {videoOuverte ? (
          <video key={video} controls autoPlay={lectureAutomatique} playsInline poster={poster.src} className="max-h-[75svh] w-full rounded-xl bg-black">
            <source src={video} type="video/mp4" />
            La lecture vidéo n’est pas prise en charge par ce navigateur.
          </video>
        ) : null}
      </dialog>
    </section>
  );
}
