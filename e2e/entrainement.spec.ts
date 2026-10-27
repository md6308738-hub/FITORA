import { expect, test, type Page } from "@playwright/test";

import {
  MOT_DE_PASSE_TEST,
  completerProfil,
  creerUtilisateurConfirme,
  supabaseConfigure,
  supprimerUtilisateur,
} from "./outils/supabase";

test.skip(!supabaseConfigure, "Supabase n'est pas configuré (.env.local).");

async function seConnecter(page: Page, email: string) {
  await page.goto("/connexion");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(MOT_DE_PASSE_TEST);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/$/);
}

test("programme : proposition, validation, séance enregistrée et historique", async ({ page }) => {
  const compte = await creerUtilisateurConfirme("Awa", "Ndiaye");
  try {
    await completerProfil(compte.id);
    await seConnecter(page, compte.email);

    // Programme : proposition puis validation
    await page.goto("/programmes");
    await page.getByRole("button", { name: "Générer mon programme" }).click();
    await expect(page.getByText("Proposition à valider")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Prise de masse · 3 séances/ })).toBeVisible();
    await page.getByRole("button", { name: "Proposer une autre version" }).click();
    await expect(page.getByText("Proposition à valider")).toBeVisible();
    await page.getByRole("button", { name: "Valider ce programme" }).click();
    await expect(page.getByText("Programme actif")).toBeVisible();
    await expect(page.getByText("Proposition à valider")).toHaveCount(0);

    // Calendrier : déplacer la première séance sur le dimanche, persistant après rechargement
    await page.getByRole("combobox", { name: "Jour" }).first().selectOption("7");
    await expect(page.getByRole("combobox", { name: "Jour" }).last()).toHaveValue("7");
    await page.reload();
    await expect(page.getByRole("combobox", { name: "Jour" }).last()).toHaveValue("7");

    // Séance : démarrer, enregistrer une série, terminer
    await page.goto("/seance");
    await page.getByRole("button", { name: /^Démarrer/ }).first().click();
    await expect(page.getByText("Séance en cours")).toBeVisible();
    const premierExercice = page.locator("section[aria-label]").first();
    const charge = premierExercice.getByLabel("Charge (kg)").first();
    if (await charge.count()) await charge.fill("40");
    await premierExercice.getByLabel(/Répétitions|Durée/).first().fill("10");
    await premierExercice.getByRole("button", { name: /Valider la série 1/ }).click();
    await expect(premierExercice.getByRole("button", { name: /Valider la série 1/ })).toHaveText(/Corriger/);
    await expect(page.getByRole("timer")).toBeVisible();

    // Reprise après rechargement : la série est conservée
    await page.reload();
    await expect(page.getByText("Séance en cours")).toBeVisible();
    await expect(page.locator("section[aria-label]").first().getByRole("button", { name: /Valider la série 1/ })).toHaveText(/Corriger/);

    await page.getByLabel("Notes (facultatif)").fill("Bonne séance");
    await page.getByRole("button", { name: "Terminer la séance" }).click();
    await expect(page.getByRole("heading", { name: "Historique" })).toBeVisible();
    await expect(page.getByText(/1 série/)).toBeVisible();

    // Bibliothèque : recherche et fiche
    await page.goto("/programmes/exercices");
    await page.getByLabel("Rechercher").fill("traction");
    await page.getByRole("link", { name: /^Tractions Dos/ }).click();
    await expect(page.getByRole("heading", { name: "Tractions", level: 1 })).toBeVisible();
    await expect(page.getByText("Erreurs courantes")).toBeVisible();
  } finally {
    await supprimerUtilisateur(compte.id);
  }
});
