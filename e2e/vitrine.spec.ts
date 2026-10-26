import { expect, test } from "@playwright/test";

test.describe("page vitrine", () => {
  test("affiche le hero et une scène 3D (ou la photo de secours)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Atteins tes objectifs" })).toBeVisible();
    await expect(page.getByText("TA FORCE. TON RYTHME. TON ÉVOLUTION.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Voir la vidéo" })).toHaveCount(0);
    // Le fond est soit un canvas WebGL, soit la vraie photo si WebGL est indisponible.
    await expect(page.locator("#accueil canvas, #accueil img").first()).toBeAttached();
  });

  test("chaque lien de navigation mène à sa section", async ({ page, isMobile }) => {
    await page.goto("/");
    for (const [libelle, id] of [
      ["Programmes", "programmes"],
      ["Nutrition", "nutrition"],
      ["Coaching", "coaching"],
      ["À propos", "a-propos"],
    ]) {
      const menu = isMobile
        ? page.getByRole("navigation", { name: "Menu" })
        : page.getByRole("navigation", { name: "Navigation principale" });
      if (isMobile) await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await menu.getByRole("link", { name: libelle, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("le menu mobile s'ouvre, se ferme avec Échap et rend le focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Menu propre au mobile.");
    await page.goto("/");
    const bouton = page.getByRole("button", { name: "Ouvrir le menu" });
    await bouton.click();
    await expect(page.locator("#menu-mobile")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#menu-mobile")).toBeHidden();
    await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toBeFocused();
  });

  test("les appels à l'action mènent à l'inscription", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Rejoindre Fitora" }).click();
    await expect(page).toHaveURL(/\/inscription$/);
    await page.goto("/");
    await page.getByRole("link", { name: /Prise de muscle/ }).click();
    await expect(page).toHaveURL(/\/inscription$/);
  });

  test("sans WebGL, la photo de secours s'affiche", async ({ browser }) => {
    const contexte = await browser.newContext();
    await contexte.addInitScript(() => {
      // Simulation d'un navigateur sans WebGL.
      const original = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
          if (type.startsWith("webgl")) return null;
          return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
        },
      });
    });
    const page = await contexte.newPage();
    await page.goto("/");
    await expect(page.getByRole("img", { name: /Athlète travaillant les biceps/ })).toBeVisible();
    await expect(page.locator("#accueil canvas")).toHaveCount(0);
    await contexte.close();
  });

  test("respecte la préférence « réduire les animations »", async ({ browser }) => {
    const contexte = await browser.newContext({ reducedMotion: "reduce" });
    const page = await contexte.newPage();
    await page.goto("/");
    // Pas de longue zone de défilement animée : le hero tient en un écran (une fois la préférence lue).
    const ecran = await page.evaluate(() => innerHeight);
    await expect
      .poll(() => page.locator("#accueil").evaluate((el) => el.getBoundingClientRect().height))
      .toBeLessThanOrEqual(ecran + 1);
    await contexte.close();
  });
});
