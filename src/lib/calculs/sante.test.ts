import { describe, expect, it } from "vitest";

import { signauxSante } from "./sante";

describe("signauxSante", () => {
  it("recommande de consulter en cas de douleur forte, sans diagnostic", () => {
    const signaux = signauxSante({ fatigue: 2, douleurIntensite: 8, sommeilMin: 480 });
    expect(signaux).toHaveLength(1);
    expect(signaux[0]?.niveau).toBe("consulter");
    expect(signaux[0]?.message).toContain("professionnel");
  });

  it("signale fatigue extrême et nuit courte, rien quand tout va bien", () => {
    expect(signauxSante({ fatigue: 5, douleurIntensite: 0, sommeilMin: 240 })).toHaveLength(2);
    expect(signauxSante({ fatigue: 2, douleurIntensite: 1, sommeilMin: 450 })).toEqual([]);
    expect(signauxSante(null)).toEqual([]);
  });
});
