/**
 * Configuration de la scène 3D de la page vitrine : ressources, cadrages de caméra
 * pilotés par le défilement et niveaux de qualité.
 */

/** Ressources externes (toutes sous licence CC0, Poly Haven — voir docs/credits-medias.md). */
export const RESSOURCES = {
  hdri: "/3d/hdri/climbing_gym_1k.hdr",
  sol: {
    map: "/3d/textures/rubber_tiles_diffuse_1k.jpg",
    normalMap: "/3d/textures/rubber_tiles_nor_gl_1k.jpg",
    roughnessMap: "/3d/textures/rubber_tiles_rough_1k.jpg",
  },
  beton: {
    map: "/3d/textures/brushed_concrete_diffuse_512.jpg",
    normalMap: "/3d/textures/brushed_concrete_nor_gl_512.jpg",
    roughnessMap: "/3d/textures/brushed_concrete_rough_512.jpg",
  },
  /**
   * Modèle d'athlète professionnel (GLB riggé avec une animation de curl).
   * Tant qu'il vaut null, le mannequin provisoire est affiché.
   * Exemple : { url: "/3d/modeles/athlete.glb", animation: "BicepCurl" }
   */
  athlete: null as { url: string; animation: string } | null,
} as const;

export type Vec3 = readonly [number, number, number];

/** Cadrage de la caméra à une étape du défilement (progression de 0 à 1). */
export type Cadrage = { progression: number; position: Vec3; cible: Vec3 };

/**
 * Séquence ordinateur : 1) vue large de la salle et de l'athlète → 2) rapprochement →
 * 3) gros plan sur l'haltère → 4) déplacement latéral vers les racks et les poulies →
 * 5) recul panoramique vers la section suivante.
 */
export const CADRAGES_ORDINATEUR: readonly Cadrage[] = [
  { progression: 0, position: [-1.0, 1.6, 5.6], cible: [0.3, 1.15, -0.3] },
  { progression: 0.25, position: [0.5, 1.35, 3.0], cible: [1.05, 1.0, 0] },
  { progression: 0.5, position: [1.85, 1.15, 1.55], cible: [1.08, 0.85, 0.35] },
  { progression: 0.75, position: [-2.0, 1.5, 2.2], cible: [-3.6, 1.0, -4.5] },
  { progression: 1, position: [-0.2, 2.7, 5.6], cible: [0.2, 1.0, -3.5] },
];

/** Même séquence en format vertical : plus de recul, sujet dans la moitié haute (texte en bas). */
export const CADRAGES_MOBILE: readonly Cadrage[] = [
  { progression: 0, position: [1.15, 1.35, 6.8], cible: [1.15, 0.45, 0] },
  { progression: 0.25, position: [1.2, 1.3, 4.6], cible: [1.15, 0.6, 0] },
  { progression: 0.5, position: [1.6, 1.05, 1.6], cible: [1.1, 0.75, 0.3] },
  { progression: 0.75, position: [-1.5, 1.5, 3.6], cible: [-4.2, 0.7, -3.6] },
  { progression: 1, position: [-0.2, 3.0, 8.0], cible: [0.2, 0.6, -3.5] },
];

export type Qualite = "haute" | "basse";

export const PARAMETRES_QUALITE = {
  haute: { dpr: [1, 1.75] as [number, number], ombres: true, tailleOmbre: 1024, halteresParRack: 10 },
  basse: { dpr: [1, 1.25] as [number, number], ombres: false, tailleOmbre: 512, halteresParRack: 6 },
} as const;

/** Appareil modeste : petit écran tactile ou peu de cœurs de processeur. */
export function detecterQualite(): Qualite {
  if (typeof window === "undefined") return "haute";
  const petitEcran = window.matchMedia("(max-width: 767px)").matches;
  const coeurs = navigator.hardwareConcurrency ?? 8;
  return petitEcran || coeurs <= 4 ? "basse" : "haute";
}

export function webglDisponible(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Interpolation des cadrages pour une progression donnée (fonction pure, testée). */
export function cadragePour(
  cadrages: readonly Cadrage[],
  progression: number,
): { position: Vec3; cible: Vec3 } {
  const p = Math.min(1, Math.max(0, progression));
  const premier = cadrages[0];
  if (!premier) throw new Error("Aucun cadrage défini.");
  let a = premier;
  let b = premier;
  for (const cadrage of cadrages) {
    if (cadrage.progression <= p) a = cadrage;
    if (cadrage.progression >= p) {
      b = cadrage;
      break;
    }
  }
  const etendue = b.progression - a.progression;
  // Lissage « ease-in-out » entre deux cadrages pour éviter les à-coups.
  const brut = etendue === 0 ? 0 : (p - a.progression) / etendue;
  const t = brut * brut * (3 - 2 * brut);
  const mix = (u: Vec3, v: Vec3): Vec3 => [
    u[0] + (v[0] - u[0]) * t,
    u[1] + (v[1] - u[1]) * t,
    u[2] + (v[2] - u[2]) * t,
  ];
  return { position: mix(a.position, b.position), cible: mix(a.cible, b.cible) };
}
