import * as THREE from "three";

/** Matériaux partagés (créés une fois, réutilisés par tous les objets de la salle). */
export const MATERIAUX = {
  acierPeint: new THREE.MeshStandardMaterial({ color: "#1b1e23", roughness: 0.45, metalness: 0.75 }),
  acierBrosse: new THREE.MeshStandardMaterial({ color: "#9aa1aa", roughness: 0.32, metalness: 1 }),
  chrome: new THREE.MeshStandardMaterial({ color: "#c9ced6", roughness: 0.18, metalness: 1 }),
  caoutchouc: new THREE.MeshStandardMaterial({ color: "#16181b", roughness: 0.88, metalness: 0 }),
  fonte: new THREE.MeshStandardMaterial({ color: "#2a2d31", roughness: 0.6, metalness: 0.65 }),
  similicuir: new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.55, metalness: 0 }),
  plafond: new THREE.MeshStandardMaterial({ color: "#121519", roughness: 0.95, metalness: 0 }),
  luminaire: new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: new THREE.Color("#fff6ea"),
    emissiveIntensity: 2.2,
    roughness: 1,
  }),
  vitre: new THREE.MeshStandardMaterial({
    color: "#cfdcea",
    emissive: new THREE.Color("#d8e6f5"),
    emissiveIntensity: 1.1,
    roughness: 0.2,
    metalness: 0,
  }),
  accentBleu: new THREE.MeshStandardMaterial({
    color: "#1687ff",
    emissive: new THREE.Color("#1687ff"),
    emissiveIntensity: 0.35,
    roughness: 0.4,
  }),
  // Mannequin provisoire : matière mate uniforme, volontairement non « peau ».
  mannequin: new THREE.MeshStandardMaterial({ color: "#6b7079", roughness: 0.62, metalness: 0.05 }),
  tissuNoir: new THREE.MeshStandardMaterial({ color: "#15171b", roughness: 0.92, metalness: 0 }),
} as const;
