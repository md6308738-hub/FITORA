"use client";

import { Environment } from "@react-three/drei";

import { RESSOURCES } from "./config";

type LightingProps = { ombres: boolean; tailleOmbre: number };

/**
 * Éclairage photographique : environnement HDRI d'une vraie salle (Poly Haven),
 * lumière principale douce venant des baies, contre-jour discret et touche bleue FITORA.
 */
export function Lighting({ ombres, tailleOmbre }: LightingProps) {
  return (
    <>
      <Environment files={RESSOURCES.hdri} environmentIntensity={0.8} />
      {/* Lumière principale : jour des baies, en hauteur, légèrement sur la droite */}
      <directionalLight
        position={[4, 6.5, -6]}
        intensity={1.6}
        color="#f3f6fb"
        castShadow={ombres}
        shadow-mapSize={[tailleOmbre, tailleOmbre]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      {/* Lumière d'appoint face à l'athlète (débouchage des ombres) */}
      <directionalLight position={[-3, 3, 5]} intensity={0.45} color="#fff1e2" />
      {/* Contour bleu très discret derrière l'athlète */}
      <pointLight position={[2.2, 1.6, -1.2]} intensity={2.2} distance={4} decay={2} color="#1687ff" />
    </>
  );
}
