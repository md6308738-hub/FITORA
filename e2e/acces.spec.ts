import { expect, test } from "@playwright/test";

// Validation côté client : ne nécessite pas de base de données.
test.describe("formulaires d'accès", () => {
  test("l'inscription signale les champs manquants et la confirmation différente", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Indiquez votre prénom.")).toBeVisible();
    await expect(page.getByText("Indiquez votre adresse email.")).toBeVisible();

    await page.getByLabel("Mot de passe", { exact: true }).fill("motdepasse1");
    await page.getByLabel("Confirmation du mot de passe").fill("autre12345");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Les mots de passe ne correspondent pas.")).toBeVisible();
  });

  test("la connexion exige l'email et le mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Indiquez votre adresse email.")).toBeVisible();
    await expect(page.getByText("Indiquez votre mot de passe.")).toBeVisible();
    await page.getByRole("link", { name: "Créer un compte" }).click();
    await expect(page).toHaveURL(/\/inscription$/);
  });
});
