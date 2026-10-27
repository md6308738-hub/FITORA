import { describe, expect, it } from "vitest";

import { MAIN_NAV_ITEMS, isNavItemActive } from "./nav-items";

describe("isNavItemActive", () => {
  it("n'active l'accueil que sur la racine", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/programmes", "/")).toBe(false);
  });

  it("active une entrée sur sa page et ses sous-pages", () => {
    expect(isNavItemActive("/programmes", "/programmes")).toBe(true);
    expect(isNavItemActive("/programmes/force", "/programmes")).toBe(true);
  });

  it("rattache les pages associées à leur entrée", () => {
    expect(isNavItemActive("/seance", "/programmes", ["/seance"])).toBe(true);
    expect(isNavItemActive("/seance", "/programmes")).toBe(false);
  });

  it("ne confond pas deux routes au préfixe commun", () => {
    expect(isNavItemActive("/programmes-archives", "/programmes")).toBe(false);
  });
});

describe("MAIN_NAV_ITEMS", () => {
  it("contient les cinq entrées principales dans l'ordre", () => {
    expect(MAIN_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Accueil",
      "Entraînement",
      "Nutrition",
      "Progrès",
      "Santé",
    ]);
  });
});
