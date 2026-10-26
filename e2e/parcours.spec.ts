import { expect, test, type Page } from "@playwright/test";

/**
 * Parcours complet inscription → questionnaire → accueil, sur le projet Supabase
 * configuré dans .env.local. Prérequis : migration appliquée et confirmation
 * par email désactivée (sinon l'inscription s'arrête sur « vérifiez vos emails »).
 */
test.skip(
  !process.env.NEXT_PUBLIC_SUPABASE_URL,
  "Supabase n'est pas configuré (.env.local).",
);

const continuer = (page: Page) => page.getByRole("button", { name: "Continuer" }).click();
const etape = (page: Page, n: number) => expect(page.getByText(`Étape ${n} sur 9`)).toBeVisible();

test("inscription, questionnaire puis accueil personnalisé", async ({ page }, testInfo) => {
  const domaine = process.env.E2E_EMAIL_DOMAIN ?? "example.com";
  const email = `e2e-${testInfo.project.name}-${Date.now()}@${domaine}`;

  // Inscription
  await page.goto("/inscription");
  await page.getByLabel("Prénom").fill("Awa");
  await page.getByLabel("Nom", { exact: true }).fill("Ndiaye");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("motdepasse1");
  await page.getByLabel("Confirmation du mot de passe").fill("motdepasse1");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  // 1. Mensurations (avec vérification de la validation)
  await etape(page, 1);
  await continuer(page);
  await expect(page.getByText("Indiquez votre âge.")).toBeVisible();
  await page.getByLabel("Âge").fill("29");
  await page.getByLabel("Taille").fill("170");
  await page.getByLabel("Poids actuel").fill("80");
  await page.getByText("Femme", { exact: true }).click();
  await continuer(page);

  // 2. Objectif, puis Retour : les réponses précédentes sont conservées
  await etape(page, 2);
  await page.getByRole("button", { name: "Retour" }).click();
  await etape(page, 1);
  await expect(page.getByLabel("Âge")).toHaveValue("29");
  await continuer(page);
  await etape(page, 2);
  await page.getByText("Perte de poids", { exact: true }).click();
  await page.getByLabel("Poids objectif (facultatif)").fill("72");
  await continuer(page);

  // 3 à 6
  await etape(page, 3);
  await page.getByText("Intermédiaire", { exact: true }).click();
  await continuer(page);
  await etape(page, 4);
  await page.getByText("Musculation", { exact: true }).click();
  await page.getByText("Cardio", { exact: true }).click();
  await continuer(page);
  await etape(page, 5);
  await page.getByText("3 jours", { exact: true }).click();
  await page.getByText("45 min", { exact: true }).click();
  await continuer(page);
  await etape(page, 6);
  await page.getByText("Salle de sport", { exact: true }).click();
  await continuer(page);

  // 7. Facultative : on passe
  await etape(page, 7);
  await page.getByRole("button", { name: "Passer" }).click();

  // 8. Alimentation
  await etape(page, 8);
  await page.getByText("Halal", { exact: true }).click();
  await continuer(page);

  // 9. Mode de vie
  await etape(page, 9);
  await page.getByText("Modérément actif", { exact: true }).click();
  await page.getByRole("button", { name: "Terminer" }).click();

  // Accueil personnalisé
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Bonjour, Awa" })).toBeVisible();
  await expect(page.getByText("Objectif : Perte de poids")).toBeVisible();
  const poids = page.getByRole("region", { name: "Poids et progression" });
  await expect(poids.getByText("80 kg")).toBeVisible();
  await expect(poids.getByText("72 kg")).toBeVisible();
  await expect(page.getByText("kcal estimées")).toBeVisible();

  // Hydratation enregistrée puis annulée
  const eau = page.getByRole("region", { name: "Hydratation" });
  await eau.getByRole("button", { name: "250 ml" }).click();
  await expect(eau.getByText(/^0,25 L/)).toBeVisible();
  await eau.getByRole("button", { name: "Annuler" }).click();
  await expect(eau.getByText(/^0 L/)).toBeVisible();

  // Nouvelle pesée
  await page.getByLabel("Corriger la pesée du jour").fill("79,4");
  await poids.getByRole("button", { name: "Enregistrer" }).click();
  await expect(poids.getByText("79,4 kg")).toBeVisible();

  // Un utilisateur connecté ne revoit pas le questionnaire terminé
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/$/);
});

test("un visiteur non connecté est renvoyé vers la connexion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/connexion$/);
});
