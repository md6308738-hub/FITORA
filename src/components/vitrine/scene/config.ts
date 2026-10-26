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
 * Séquence ordinateur : vue large → rapprochement de l'athlète → angle qui révèle
 * la profondeur → focus sur l'haltère → déplacement vers la zone des racks.
 */
export const CADRAGES_ORDINATEUR: readonly Cadrage[] = [
  { progression: 0, position: [-0.5, 1.45, 4.5], cible: [0.15, 1.1, 0] },
  { progression: 0.3, position: [0.5, 1.35, 3.1], cible: [1.0, 1.0, 0] },
  { progression: 0.55, position: [2.9, 1.35, 3.1], cible: [1.2, 1.05, 0] },
  { progression: 0.75, position: [2.05, 1.2, 1.55], cible: [1.35, 1.1, 0.15] },
  { progression: 1, position: [-0.6, 1.9, 3.4], cible: [-4.2, 1.0, -2.6] },
];

/** Séquence verticale (mobile) : plus de recul, athlète dans la moitié haute, texte en bas. */
export const CADRAGES_MOBILE: readonly Cadrage[] = [
  { progression: 0, position: [1.15, 1.35, 6.3], cible: [1.15, 0.45, 0] },
  { progression: 0.3, position: [1.2, 1.3, 4.6], cible: [1.15, 0.6, 0] },
  { progression: 0.55, position: [2.8, 1.3, 3.9], cible: [1.2, 1.1, 0] },
  { progression: 0.75, position: [2.0, 1.2, 2.3], cible: [1.3, 1.1, 0.15] },
  { progression: 1, position: [-1.2, 1.8, 4.6], cible: [-4.2, 1.0, -2.6] },
];

/** Plage du défilement où le curl suit la molette (focus sur l'haltère). */
export const PLAGE_CURL_PILOTE = [0.55, 0.78] as const;

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
