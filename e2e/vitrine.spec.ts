import { expect, test } from "@playwright/test";

test.describe("page vitrine", () => {
  test("affiche le hero sur une vraie vidéo filmée", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Atteins tes objectifs" })).toBeVisible();
    await expect(page.getByText("TA FORCE. TON RYTHME. TON ÉVOLUTION.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Voir la vidéo" })).toHaveCount(0);
    await expect(page.locator("#accueil video")).toBeAttached();
    await expect(page.locator("#accueil video")).toHaveJSProperty("muted", true);
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

  test("sur ordinateur, la vidéo avance et recule avec le défilement", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sur mobile, la vidéo tourne en boucle.");
    await page.goto("/");
    const video = page.locator("#accueil video");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(1);
    const hauteur = await page.locator("#accueil").evaluate((el) => el.scrollHeight - innerHeight);
    await page.evaluate((y) => scrollTo(0, y), Math.round(hauteur * 0.6));
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(5);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(1);
  });

  test("respecte la préférence « réduire les animations »", async ({ browser }) => {
    const contexte = await browser.newContext({ reducedMotion: "reduce" });
    const page = await contexte.newPage();
    await page.goto("/");
    await expect(page.locator("#accueil video")).toHaveCount(0);
    // Pas de longue zone de défilement animée : le hero tient en un écran (une fois la préférence lue).
    const ecran = await page.evaluate(() => innerHeight);
    await expect
      .poll(() => page.locator("#accueil").evaluate((el) => el.getBoundingClientRect().height))
      .toBeLessThanOrEqual(ecran + 1);
    await contexte.close();
  });
});
