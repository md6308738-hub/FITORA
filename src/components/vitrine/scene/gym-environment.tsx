"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { RESSOURCES } from "./config";
import { Banc, CageASquat, Haltere, MachinePoulie, RackHalteres } from "./equipment";
import { MATERIAUX } from "./materials";

const LARGEUR = 22;
const PROFONDEUR = 18;
const HAUTEUR = 5.2;
const MUR_FOND = -8;

/** Copies des textures (le cache est partagé par URL) réglées pour une répétition donnée. */
function useTexturesRepetees<K extends string>(
  urls: Record<K, string>,
  repetition: [number, number],
): Record<K, THREE.Texture> {
  const sources = useTexture(urls) as Record<K, THREE.Texture>;
  return useMemo(() => {
    const copies = {} as Record<K, THREE.Texture>;
    for (const cle of Object.keys(sources) as K[]) {
      const texture = sources[cle].clone();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...repetition);
      texture.anisotropy = 8;
      texture.colorSpace = cle === "map" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.needsUpdate = true;
      copies[cle] = texture;
    }
    return copies;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- répétition constante par appel
  }, [sources]);
}

function Sol() {
  const maps = useTexturesRepetees(RESSOURCES.sol, [LARGEUR / 1.5, PROFONDEUR / 1.5]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
      <planeGeometry args={[LARGEUR, PROFONDEUR]} />
      <meshStandardMaterial {...maps} color="#5b6068" roughness={1} normalScale={new THREE.Vector2(0.6, 0.6)} />
    </mesh>
  );
}

/** Mur du fond en béton percé de grandes baies vitrées industrielles. */
function MurDuFond() {
  const maps = useTexturesRepetees(RESSOURCES.beton, [4, 1.5]);
  const beton = useMemo(
    () => new THREE.MeshStandardMaterial({ ...maps, color: "#8a8f96", roughness: 1 }),
    [maps],
  );
  const baies = [-6.6, -2.2, 2.2, 6.6];
  const largeurBaie = 3.6;
  return (
    <group position={[0, 0, MUR_FOND]}>
      {/* Allège et linteau */}
      <mesh material={beton} position={[0, 0.45, 0]} receiveShadow>
        <boxGeometry args={[LARGEUR, 0.9, 0.3]} />
      </mesh>
      <mesh material={beton} position={[0, HAUTEUR - 0.35, 0]}>
        <boxGeometry args={[LARGEUR, 0.7, 0.3]} />
      </mesh>
      {/* Trumeaux entre les baies */}
      {[-8.8, -4.4, 0, 4.4, 8.8].map((x) => (
        <mesh key={x} material={beton} position={[x, HAUTEUR / 2, 0]} receiveShadow>
          <boxGeometry args={[0.8, HAUTEUR, 0.3]} />
        </mesh>
      ))}
      {baies.map((x) => (
        <group key={x} position={[x, 0.9 + (HAUTEUR - 1.6) / 2, 0]}>
          <mesh material={MATERIAUX.vitre} position={[0, 0, -0.05]}>
            <planeGeometry args={[largeurBaie, HAUTEUR - 1.6]} />
          </mesh>
          {/* Menuiseries acier : meneaux et traverses */}
          {[-1, 0, 1].map((i) => (
            <mesh key={`v${i}`} material={MATERIAUX.acierPeint} position={[i * (largeurBaie / 3), 0, 0.02]}>
              <boxGeometry args={[0.05, HAUTEUR - 1.6, 0.06]} />
            </mesh>
          ))}
          {[-0.33, 0.33].map((f) => (
            <mesh key={`h${f}`} material={MATERIAUX.acierPeint} position={[0, f * (HAUTEUR - 1.6), 0.02]}>
              <boxGeometry args={[largeurBaie, 0.04, 0.06]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function MursLateraux() {
  const maps = useTexturesRepetees(RESSOURCES.beton, [3, 1.2]);
  return (
    <>
      {[-LARGEUR / 2, LARGEUR / 2].map((x) => (
        <mesh key={x} position={[x, HAUTEUR / 2, -1]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[PROFONDEUR, HAUTEUR]} />
          <meshStandardMaterial {...maps} color="#6f747b" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

/** Plafond sombre, poutres IPN et rampes lumineuses. */
function Plafond() {
  const poutres = [-6, -3, 0, 3];
  return (
    <group>
      <mesh material={MATERIAUX.plafond} position={[0, HAUTEUR, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LARGEUR, PROFONDEUR]} />
      </mesh>
      {poutres.map((z) => (
        <group key={z} position={[0, HAUTEUR - 0.25, z]}>
          <mesh material={MATERIAUX.acierPeint}>
            <boxGeometry args={[LARGEUR, 0.36, 0.03]} />
          </mesh>
          {[-0.17, 0.17].map((y) => (
            <mesh key={y} material={MATERIAUX.acierPeint} position={[0, y, 0]}>
              <boxGeometry args={[LARGEUR, 0.025, 0.18]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Rampes LED suspendues */}
      {[-4.5, -1.5, 1.5, 4.5].map((z) =>
        [-5, 0, 5].map((x) => (
          <mesh key={`${x}${z}`} material={MATERIAUX.luminaire} position={[x, HAUTEUR - 0.7, z]}>
            <boxGeometry args={[2.4, 0.04, 0.12]} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Équipements répartis à plusieurs distances pour donner de la profondeur aux mouvements de caméra. */
function Equipements({ halteresParRack }: { halteresParRack: number }) {
  return (
    <group>
      {/* Premier plan gauche : rack d'haltères (cible du dernier cadrage) */}
      <RackHalteres nombre={halteresParRack} position={[-4.6, 0, -2.4]} rotation={[0, Math.PI / 2.4, 0]} />
      <RackHalteres nombre={halteresParRack} position={[-5.8, 0, -5.6]} rotation={[0, Math.PI / 2, 0]} />
      {/* Plan moyen droit : cages à squat devant les baies */}
      <CageASquat position={[4.6, 0, -4.4]} rotation={[0, -0.25, 0]} />
      <CageASquat position={[7.2, 0, -5.2]} rotation={[0, -0.25, 0]} />
      {/* Arrière-plan : bancs et poulies */}
      <Banc position={[-1.8, 0, -4.6]} rotation={[0, Math.PI / 2, 0]} />
      <Banc position={[1.6, 0, -6.1]} rotation={[0, Math.PI / 2.2, 0]} />
      <MachinePoulie position={[-1.2, 0, -7.2]} />
      <MachinePoulie position={[0.6, 0, -7.2]} />
      {/* Haltères posés au sol près des bancs */}
      <Haltere kilos={20} position={[-1.35, 0.075, -4.2]} rotation={[0, 0.4, 0]} />
      <Haltere kilos={20} position={[-1.3, 0.075, -4.55]} rotation={[0, 0.2, 0]} />
    </group>
  );
}

export function GymEnvironment({ halteresParRack }: { halteresParRack: number }) {
  return (
    <group>
      <Sol />
      <MurDuFond />
      <MursLateraux />
      <Plafond />
      <Equipements halteresParRack={halteresParRack} />
    </group>
  );
}
