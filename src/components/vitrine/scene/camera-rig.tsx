"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import type { EtatScene } from "./athlete";
import { CADRAGES_MOBILE, CADRAGES_ORDINATEUR, cadragePour } from "./config";

type CameraRigProps = {
  etat: MutableRefObject<EtatScene>;
  /** Faux : caméra fixe (préférence « réduire les animations »). */
  anime: boolean;
};

/**
 * Déplace la caméra le long des cadrages selon la progression du défilement,
 * avec un amortissement pour un mouvement continu, et une très légère réaction au pointeur.
 */
export function CameraRig({ etat, anime }: CameraRigProps) {
  const { camera, size } = useThree();
  const vertical = size.width < size.height;
  const cadrages = vertical ? CADRAGES_MOBILE : CADRAGES_ORDINATEUR;

  const progression = useRef(0);
  const intro = useRef(anime ? 0 : 1);
  const pointeur = useRef(new THREE.Vector2());
  const cible = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3());

  useEffect(() => {
    const auMouvement = (evenement: PointerEvent) => {
      pointeur.current.set(
        (evenement.clientX / window.innerWidth) * 2 - 1,
        (evenement.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", auMouvement, { passive: true });
    return () => window.removeEventListener("pointermove", auMouvement);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const visee = anime ? etat.current.progression : 0;
    progression.current += (visee - progression.current) * Math.min(1, dt * 4);
    // Entrée : léger travelling avant pendant les deux premières secondes.
    intro.current = Math.min(1, intro.current + dt / 2.2);
    const recul = (1 - intro.current) ** 3 * 1.2;

    const cadre = cadragePour(cadrages, progression.current);
    const parallaxe = anime && !vertical ? 0.08 : 0;
    position.current.set(
      cadre.position[0] + pointeur.current.x * parallaxe,
      cadre.position[1] - pointeur.current.y * parallaxe * 0.5,
      cadre.position[2] + recul,
    );
    cible.current.set(...cadre.cible);

    camera.position.copy(position.current);
    camera.lookAt(cible.current);
  });

  return null;
}
