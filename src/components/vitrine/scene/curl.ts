/**
 * Cinématique d'un curl biceps assis (fonction pure, testée).
 * Phases : repos → montée contrôlée → contraction → descente lente.
 */

export const DUREES_CURL = {
  repos: 0.9,
  montee: 1.1,
  contraction: 0.45,
  descente: 2.0,
} as const;

export const DUREE_CYCLE =
  DUREES_CURL.repos + DUREES_CURL.montee + DUREES_CURL.contraction + DUREES_CURL.descente;

/** Angle du coude en radians : légèrement fléchi au repos, ~135° en contraction. */
export const COUDE_REPOS = 0.22;
export const COUDE_CONTRACTION = 2.35;

const lisser = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

export type PoseCurl = {
  /** Flexion du coude (rad). */
  coude: number;
  /** Supination de l'avant-bras (0 = prise neutre, 1 = paume vers le haut). */
  supination: number;
  /** Avancement dans le mouvement, de 0 (bras tendu) à 1 (contraction). */
  amplitude: number;
};

/** Amplitude du mouvement (0–1) à un instant du cycle. */
export function amplitudeCurl(temps: number): number {
  const t = ((temps % DUREE_CYCLE) + DUREE_CYCLE) % DUREE_CYCLE;
  const { repos, montee, contraction } = DUREES_CURL;
  if (t < repos) return 0;
  if (t < repos + montee) return lisser((t - repos) / montee);
  if (t < repos + montee + contraction) return 1;
  return 1 - lisser((t - repos - montee - contraction) / DUREES_CURL.descente);
}

/** Pose du bras pour une amplitude donnée (0–1). */
export function poseCurl(amplitude: number): PoseCurl {
  const a = Math.min(1, Math.max(0, amplitude));
  return {
    coude: COUDE_REPOS + (COUDE_CONTRACTION - COUDE_REPOS) * a,
    // La supination se fait surtout dans la première moitié de la montée.
    supination: Math.min(1, a * 1.6),
    amplitude: a,
  };
}
