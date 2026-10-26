"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type * as THREE from "three";

import { PLAGE_CURL_PILOTE } from "./config";
import { amplitudeCurl, poseCurl } from "./curl";
import { Banc, Haltere } from "./equipment";
import { MATERIAUX } from "./materials";

/**
 * MANNEQUIN PROVISOIRE.
 * Silhouette articulée aux proportions d'un adulte (~1,80 m), sans visage, en
 * matière mate : elle ne prétend pas être photoréaliste. Elle sera remplacée par
 * un modèle GLB riggé professionnel déclaré dans RESSOURCES.athlete (config.ts).
 */

type Membre = { longueur: number; rayon: number; materiau?: THREE.Material };

/** Segment de membre orienté vers le bas depuis son articulation. */
function Segment({ longueur, rayon, materiau = MATERIAUX.mannequin }: Membre) {
  return (
    <mesh material={materiau} position={[0, -longueur / 2, 0]} castShadow>
      <capsuleGeometry args={[rayon, Math.max(0.01, longueur - 2 * rayon), 6, 14]} />
    </mesh>
  );
}

export type EtatScene = { progression: number };

type AthleteProps = ThreeElements["group"] & {
  etat: MutableRefObject<EtatScene>;
  anime: boolean;
};

export function Athlete({ etat, anime, ...props }: AthleteProps) {
  const temps = useRef(0);
  const amplitude = useRef(0);
  const colonne = useRef<THREE.Group>(null);
  const torse = useRef<THREE.Group>(null);
  const tete = useRef<THREE.Group>(null);
  const brasTravail = useRef<THREE.Group>(null);
  const avantBras = useRef<THREE.Group>(null);
  const poignet = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!anime) return;
    const dt = Math.min(delta, 0.05);
    temps.current += dt;

    // Hors du focus : mouvement autonome. Dans la plage de focus : le curl suit le défilement.
    const [debut, fin] = PLAGE_CURL_PILOTE;
    const p = etat.current.progression;
    const dansFocus = p > debut && p < fin;
    const cibleScroll = Math.sin(((p - debut) / (fin - debut)) * Math.PI);
    const cible = dansFocus ? cibleScroll : amplitudeCurl(temps.current);
    amplitude.current += (cible - amplitude.current) * Math.min(1, dt * 6);

    const pose = poseCurl(amplitude.current);
    const respiration = Math.sin(temps.current * 1.6) * 0.5 + 0.5;

    if (avantBras.current) avantBras.current.rotation.x = -pose.coude;
    if (poignet.current) poignet.current.rotation.y = -pose.supination * 1.2;
    // Le bras reste collé au corps ; légère avancée du coude en fin de montée.
    if (brasTravail.current) brasTravail.current.rotation.x = -0.18 - pose.amplitude * 0.12;
    // Gainage : le buste se redresse un peu pendant l'effort, sans élan.
    if (colonne.current) colonne.current.rotation.x = 0.16 - pose.amplitude * 0.04;
    if (torse.current) torse.current.scale.set(1 + respiration * 0.012, 1, 1 + respiration * 0.02);
    if (tete.current) tete.current.rotation.x = 0.28 - pose.amplitude * 0.05;
  });

  const repos = poseCurl(0);

  return (
    <group {...props}>
      {/* Assis au bout du banc, le banc s'étend derrière l'athlète */}
      <Banc position={[0, 0, -0.5]} />

      {/* Bassin, assis au bord du banc */}
      <group position={[0, 0.58, -0.02]}>
        <mesh material={MATERIAUX.tissuNoir} scale={[1.15, 0.8, 0.9]} castShadow>
          <sphereGeometry args={[0.16, 20, 14]} />
        </mesh>

        {/* Jambes : cuisses à l'horizontale, tibias verticaux, pieds à plat */}
        {[-1, 1].map((cote) => (
          <group key={cote} position={[cote * 0.11, -0.02, 0.02]} rotation={[-1.48, 0, cote * 0.16]}>
            <Segment longueur={0.2} rayon={0.092} materiau={MATERIAUX.tissuNoir} />
            <group position={[0, -0.18, 0]}>
              <Segment longueur={0.26} rayon={0.082} />
            </group>
            <group position={[0, -0.44, 0]} rotation={[1.5, 0, -cote * 0.12]}>
              <Segment longueur={0.43} rayon={0.062} />
              <mesh material={MATERIAUX.tissuNoir} position={[0, -0.45, 0.06]} castShadow>
                <boxGeometry args={[0.1, 0.07, 0.26]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* Colonne et buste, légèrement penchés vers l'avant */}
        <group ref={colonne} rotation={[0.16, 0, 0]}>
          <group ref={torse} position={[0, 0.27, 0]}>
            <mesh material={MATERIAUX.tissuNoir} scale={[1.3, 1, 0.78]} castShadow>
              <capsuleGeometry args={[0.15, 0.24, 8, 18]} />
            </mesh>
            {/* Marque FITORA discrète sur la poitrine */}
            <mesh material={MATERIAUX.accentBleu} position={[0.09, 0.1, 0.118]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.05, 0.012, 0.004]} />
            </mesh>
          </group>

          <group position={[0, 0.5, 0]}>
            <mesh material={MATERIAUX.mannequin} position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.058, 0.1, 14]} />
            </mesh>
            <group ref={tete} position={[0, 0.17, 0.01]} rotation={[0.28, 0, 0]}>
              <mesh material={MATERIAUX.mannequin} scale={[0.85, 1.08, 0.98]} castShadow>
                <sphereGeometry args={[0.11, 24, 18]} />
              </mesh>
            </group>
          </group>

          {/* Bras de travail (côté caméra) : curl */}
          <group position={[0.21, 0.46, 0]}>
            <mesh material={MATERIAUX.tissuNoir} scale={[1, 0.85, 1]} castShadow>
              <sphereGeometry args={[0.075, 16, 12]} />
            </mesh>
            <group ref={brasTravail} rotation={[-0.18, 0, 0.06]}>
              <Segment longueur={0.3} rayon={0.056} />
              <group ref={avantBras} position={[0, -0.3, 0]} rotation={[-repos.coude, 0, 0]}>
                <Segment longueur={0.26} rayon={0.045} />
                <group ref={poignet} position={[0, -0.27, 0]}>
                  <mesh material={MATERIAUX.mannequin} position={[0, -0.03, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.08, 0.04]} />
                  </mesh>
                  <Haltere kilos={16} position={[0, -0.045, 0]} rotation={[0, Math.PI / 2, 0]} />
                </group>
              </group>
            </group>
          </group>

          {/* Bras opposé : haltère en appui sur la cuisse */}
          <group position={[-0.21, 0.46, 0]}>
            <mesh material={MATERIAUX.tissuNoir} scale={[1, 0.85, 1]} castShadow>
              <sphereGeometry args={[0.075, 16, 12]} />
            </mesh>
            <group rotation={[-0.55, 0, -0.1]}>
              <Segment longueur={0.3} rayon={0.056} />
              {/* Avant-bras posé sur la cuisse, haltère au niveau du genou */}
              <group position={[0, -0.3, 0]} rotation={[-1.0, 0, 0.12]}>
                <Segment longueur={0.26} rayon={0.045} />
                <group position={[0, -0.27, 0]}>
                  <mesh material={MATERIAUX.mannequin} position={[0, -0.03, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.08, 0.04]} />
                  </mesh>
                  <Haltere kilos={16} position={[0, -0.045, 0]} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
