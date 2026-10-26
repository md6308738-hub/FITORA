import { describe, expect, it } from "vitest";

import { CADRAGES_MOBILE, CADRAGES_ORDINATEUR, cadragePour } from "./config";
import { COUDE_CONTRACTION, COUDE_REPOS, DUREES_CURL, DUREE_CYCLE, amplitudeCurl, poseCurl } from "./curl";

describe("cadragePour", () => {
  it("retrouve exactement les cadrages clés", () => {
    for (const cadrage of CADRAGES_ORDINATEUR) {
      const resultat = cadragePour(CADRAGES_ORDINATEUR, cadrage.progression);
      expect(resultat.position).toEqual(cadrage.position);
      expect(resultat.cible).toEqual(cadrage.cible);
    }
  });

  it("borne la progression et reste continu (pas de saut de caméra)", () => {
    expect(cadragePour(CADRAGES_MOBILE, -1)).toEqual(cadragePour(CADRAGES_MOBILE, 0));
    expect(cadragePour(CADRAGES_MOBILE, 2)).toEqual(cadragePour(CADRAGES_MOBILE, 1));
    let precedent = cadragePour(CADRAGES_ORDINATEUR, 0).position;
    for (let p = 0.002; p <= 1; p += 0.002) {
      const position = cadragePour(CADRAGES_ORDINATEUR, p).position;
      const saut = Math.hypot(position[0] - precedent[0], position[1] - precedent[1], position[2] - precedent[2]);
      expect(saut).toBeLessThan(0.05);
      precedent = position;
    }
  });

  it("est réversible : même cadrage à l'aller et au retour", () => {
    expect(cadragePour(CADRAGES_ORDINATEUR, 0.47)).toEqual(cadragePour(CADRAGES_ORDINATEUR, 0.47));
  });
});

describe("curl", () => {
  it("enchaîne repos, montée, contraction puis descente plus lente", () => {
    expect(amplitudeCurl(0.1)).toBe(0);
    expect(amplitudeCurl(DUREES_CURL.repos + DUREES_CURL.montee + 0.1)).toBe(1);
    expect(DUREES_CURL.descente).toBeGreaterThan(DUREES_CURL.montee);
    // Cycle périodique
    expect(amplitudeCurl(1.5)).toBeCloseTo(amplitudeCurl(1.5 + DUREE_CYCLE), 10);
  });

  it("reste dans des angles articulaires plausibles", () => {
    for (let t = 0; t < DUREE_CYCLE; t += 0.05) {
      const pose = poseCurl(amplitudeCurl(t));
      expect(pose.coude).toBeGreaterThanOrEqual(COUDE_REPOS);
      expect(pose.coude).toBeLessThanOrEqual(COUDE_CONTRACTION);
      expect(pose.coude).toBeLessThan(Math.PI * 0.8); // jamais au-delà de ~145°
      expect(pose.supination).toBeGreaterThanOrEqual(0);
      expect(pose.supination).toBeLessThanOrEqual(1);
    }
  });
});
