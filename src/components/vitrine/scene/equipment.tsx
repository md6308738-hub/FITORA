"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

import { MATERIAUX } from "./materials";

type GroupProps = ThreeElements["group"];

/**
 * Haltère hexagonal : poignée chromée moletée et têtes en caoutchouc.
 * L'axe de la poignée est l'axe X local.
 */
export function Haltere({ kilos = 12, ...props }: GroupProps & { kilos?: number }) {
  const rayon = 0.045 + Math.min(kilos, 40) * 0.0011;
  const largeurTete = 0.05 + Math.min(kilos, 40) * 0.0016;
  const poignee = 0.13;
  return (
    <group {...props}>
      <mesh material={MATERIAUX.chrome} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, poignee + 0.02, 12]} />
      </mesh>
      {[-1, 1].map((cote) => (
        <group key={cote} position={[cote * (poignee / 2 + largeurTete / 2), 0, 0]}>
          <mesh material={MATERIAUX.caoutchouc} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[rayon, rayon, largeurTete, 6]} />
          </mesh>
          {/* Embout métallique */}
          <mesh
            material={MATERIAUX.acierBrosse}
            position={[cote * (largeurTete / 2 + 0.003), 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[rayon * 0.42, rayon * 0.42, 0.008, 18]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Rack à haltères à deux niveaux, rangés par poids croissant. */
export function RackHalteres({ nombre = 10, ...props }: GroupProps & { nombre?: number }) {
  const longueur = 2.6;
  const pas = longueur / nombre;
  const niveaux = [
    { y: 0.42, z: 0.12, debut: 2 },
    { y: 0.78, z: -0.08, debut: 2 + nombre * 2 },
  ];
  return (
    <group {...props}>
      {/* Montants et traverses */}
      {[-longueur / 2, 0, longueur / 2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={MATERIAUX.acierPeint} position={[0, 0.45, 0.14]} castShadow>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
          </mesh>
          <mesh material={MATERIAUX.acierPeint} position={[0, 0.45, -0.14]} castShadow>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
          </mesh>
          <mesh material={MATERIAUX.acierPeint} position={[0, 0.02, 0]}>
            <boxGeometry args={[0.07, 0.04, 0.6]} />
          </mesh>
        </group>
      ))}
      {niveaux.map((niveau) => (
        <group key={niveau.y}>
          <mesh material={MATERIAUX.acierPeint} position={[0, niveau.y - 0.07, niveau.z]} rotation={[-0.25, 0, 0]} receiveShadow>
            <boxGeometry args={[longueur + 0.05, 0.03, 0.26]} />
          </mesh>
          {Array.from({ length: nombre }, (_, i) => (
            <Haltere
              key={i}
              kilos={niveau.debut + i * 2}
              position={[-longueur / 2 + pas * (i + 0.5), niveau.y, niveau.z]}
              rotation={[-0.25, Math.PI / 2, 0]}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Banc de musculation plat. */
export function Banc(props: GroupProps) {
  return (
    <group {...props}>
      <RoundedBox args={[0.3, 0.09, 1.2]} radius={0.035} smoothness={3} position={[0, 0.44, 0]} material={MATERIAUX.similicuir} castShadow receiveShadow />
      <mesh material={MATERIAUX.acierPeint} position={[0, 0.37, 0]} castShadow>
        <boxGeometry args={[0.08, 0.05, 1.1]} />
      </mesh>
      {[-0.45, 0.45].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh material={MATERIAUX.acierPeint} position={[0, 0.19, 0]} castShadow>
            <boxGeometry args={[0.07, 0.36, 0.07]} />
          </mesh>
          <mesh material={MATERIAUX.acierPeint} position={[0, 0.025, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.05, 0.08]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Disque de poids en caoutchouc avec moyeu métallique. */
export function Disque({ rayon = 0.225, epaisseur = 0.055, ...props }: GroupProps & { rayon?: number; epaisseur?: number }) {
  return (
    <group {...props}>
      <mesh material={MATERIAUX.caoutchouc} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[rayon, rayon, epaisseur, 40]} />
      </mesh>
      <mesh material={MATERIAUX.acierBrosse} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, epaisseur + 0.006, 20]} />
      </mesh>
    </group>
  );
}

/** Barre olympique (2,2 m) avec manchons. */
export function Barre(props: GroupProps) {
  return (
    <group {...props}>
      <mesh material={MATERIAUX.chrome} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 1.31, 12]} />
      </mesh>
      {[-1, 1].map((cote) => (
        <mesh key={cote} material={MATERIAUX.acierBrosse} position={[cote * 0.86, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.42, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/** Cage à squat avec barre chargée et rangement de disques. */
export function CageASquat(props: GroupProps) {
  const montants: [number, number][] = [
    [-0.6, -0.5],
    [0.6, -0.5],
    [-0.6, 0.5],
    [0.6, 0.5],
  ];
  return (
    <group {...props}>
      {montants.map(([x, z]) => (
        <mesh key={`${x}${z}`} material={MATERIAUX.acierPeint} position={[x, 1.15, z]} castShadow receiveShadow>
          <boxGeometry args={[0.075, 2.3, 0.075]} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} material={MATERIAUX.acierPeint} position={[0, 2.27, z]} castShadow>
          <boxGeometry args={[1.28, 0.075, 0.075]} />
        </mesh>
      ))}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} material={MATERIAUX.acierPeint} position={[x, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.075, 0.075, 1.1]} />
        </mesh>
      ))}
      {/* Barre chargée posée sur les crochets */}
      <group position={[0, 1.38, 0.5]}>
        <Barre />
        {[-1, 1].map((cote) => (
          <group key={cote}>
            <Disque position={[cote * 0.72, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Disque position={[cote * 0.79, 0, 0]} rotation={[0, Math.PI / 2, 0]} rayon={0.18} epaisseur={0.04} />
          </group>
        ))}
      </group>
      {/* Disques rangés sur les tiges arrière */}
      {[-1, 1].map((cote) => (
        <group key={cote} position={[cote * 0.75, 0.5, -0.5]}>
          <mesh material={MATERIAUX.acierBrosse} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <Disque key={i} position={[cote * (0.04 + i * 0.06), 0, 0]} rotation={[0, Math.PI / 2, 0]} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Poulie vis-à-vis simplifiée : cadre, pile de charges et poulie. */
export function MachinePoulie(props: GroupProps) {
  return (
    <group {...props}>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} material={MATERIAUX.acierPeint} position={[x, 1.1, 0]} castShadow>
          <boxGeometry args={[0.09, 2.2, 0.12]} />
        </mesh>
      ))}
      <mesh material={MATERIAUX.acierPeint} position={[0, 2.18, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.14]} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} material={MATERIAUX.fonte} position={[0, 0.12 + i * 0.045, 0]} castShadow>
          <boxGeometry args={[0.42, 0.04, 0.1]} />
        </mesh>
      ))}
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} material={MATERIAUX.chrome} position={[x, 1.1, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 2.1, 8]} />
        </mesh>
      ))}
      <mesh material={MATERIAUX.acierBrosse} position={[0, 2.0, 0.1]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 20]} />
      </mesh>
      <mesh material={MATERIAUX.acierPeint} position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.95, 0.06, 0.7]} />
      </mesh>
    </group>
  );
}
