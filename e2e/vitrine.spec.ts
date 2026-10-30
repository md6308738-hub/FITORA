import { expect, test } from "@playwright/test";

test.describe("page vitrine", () => {
  test("affiche le nouveau hero et sa vidéo de présentation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Une meilleure version de toi" })).toBeVisible();
    await expect(page.getByText("TON PARTENAIRE FITNESS")).toBeVisible();
    await expect(page.getByRole("img", { name: /Athlète réalisant un exercice de musculation/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Commencer maintenant" })).toHaveAttribute("href", "/inscription");
    await expect(page.getByRole("heading", { level: 2, name: "Des solutions complètes pour ta progression" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Voir la vidéo/ })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Vidéo de présentation FITORA" })).toBeHidden();
    await page.getByRole("button", { name: /Voir la vidéo/ }).click();
    await expect(page.getByRole("dialog", { name: "Vidéo de présentation FITORA" })).toBeVisible();
    await expect(page.getByRole("dialog").locator("video[controls]")).toBeAttached();
    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(page.getByRole("dialog", { name: "Vidéo de présentation FITORA" })).toBeHidden();
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

  test("respecte la préférence « réduire les animations » sans créer de long défilement", async ({ browser }) => {
    const contexte = await browser.newContext({ reducedMotion: "reduce" });
    const page = await contexte.newPage();
    await page.goto("/");
    await expect(page.locator("#accueil video")).toHaveCount(0);
    // Le hero en pile reste compact sur mobile et ne crée pas le long scroll cinématique d’avant.
    const ecran = await page.evaluate(() => innerHeight);
    await expect
      .poll(() => page.locator("#accueil").evaluate((el) => el.getBoundingClientRect().height))
      .toBeLessThanOrEqual(ecran * 1.6);
    await contexte.close();
  });
});
