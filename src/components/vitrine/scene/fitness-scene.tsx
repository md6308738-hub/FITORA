"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, type MutableRefObject } from "react";
import * as THREE from "three";

import { Athlete, type EtatScene } from "./athlete";
import { CameraRig } from "./camera-rig";
import { PARAMETRES_QUALITE, type Qualite } from "./config";
import { GymEnvironment } from "./gym-environment";
import { Lighting } from "./lighting";

type FitnessSceneProps = {
  etat: MutableRefObject<EtatScene>;
  qualite: Qualite;
  anime: boolean;
  /** Faux quand la scène est hors de l'écran : le rendu est suspendu. */
  visible: boolean;
  onPrete: () => void;
};

function SignalPret({ onPrete }: { onPrete: () => void }) {
  useEffect(() => {
    onPrete();
  }, [onPrete]);
  return null;
}

/** Scène WebGL de la salle. Chargée uniquement côté navigateur. */
export default function FitnessScene({ etat, qualite, anime, visible, onPrete }: FitnessSceneProps) {
  const reglages = PARAMETRES_QUALITE[qualite];
  return (
    <Canvas
      aria-hidden="true"
      dpr={reglages.dpr}
      shadows={reglages.ombres ? "percentage" : false}
      frameloop={visible ? "always" : "never"}
      camera={{ fov: 38, near: 0.1, far: 40, position: [-0.5, 1.45, 5.7] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        scene.fog = new THREE.Fog("#0b0f15", 10, 24);
        scene.background = new THREE.Color("#080b10");
      }}
      className="pointer-events-none"
    >
      <AdaptiveDpr pixelated={false} />
      <Suspense fallback={null}>
        <Lighting ombres={reglages.ombres} tailleOmbre={reglages.tailleOmbre} />
        <GymEnvironment halteresParRack={reglages.halteresParRack} />
        <Athlete anime={anime} position={[1.25, 0, 0]} rotation={[0, -0.55, 0]} />
        <SignalPret onPrete={onPrete} />
      </Suspense>
      <CameraRig etat={etat} anime={anime} />
    </Canvas>
  );
}
