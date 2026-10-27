import { readFile } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";

import {
  MOT_DE_PASSE_TEST,
  completerProfil,
  creerUtilisateurConfirme,
  supabaseConfigure,
  supprimerUtilisateur,
} from "./outils/supabase";

test.skip(!supabaseConfigure, "Supabase n'est pas configuré (.env.local).");
test.skip(({ isMobile }) => isMobile, "Parcours de données : une exécution suffit.");

async function seConnecter(page: Page, email: string) {
  await page.goto("/connexion");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(MOT_DE_PASSE_TEST);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function avecCompte(page: Page, scenario: () => Promise<void>) {
  const compte = await creerUtilisateurConfirme("Awa", "Ndiaye");
  try {
    await completerProfil(compte.id);
    await page.request.post("/"); // réchauffe la route
    await seConnecter(page, compte.email);
    await scenario();
  } finally {
    await supprimerUtilisateur(compte.id);
  }
}

test("profil, consentement santé, journal de santé et export des données", async ({ page }) => {
  await avecCompte(page, async () => {
    await page.goto("/profil");
    await page.getByLabel("Prénom").fill("Aïssatou");
    await page.getByRole("button", { name: "Enregistrer" }).first().click();
    await expect(page.getByText("Informations mises à jour.")).toBeVisible();

    // Santé : consentement exigé avant toute saisie
    await page.goto("/sante");
    await page.getByRole("button", { name: "J’accepte le suivi de mes données de santé" }).click();
    await page.getByLabel("Sommeil cette nuit").fill("6,5");
    await page.getByLabel("Douleur ou inconfort (zone)").fill("genou droit");
    await page.getByLabel("Intensité de la douleur (0 à 10)").fill("8");
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
    await expect(page.getByText("Journal du jour enregistré.")).toBeVisible();
    await expect(page.getByText(/consulte un professionnel de santé/)).toBeVisible();
    // Rappel sur la page Séance
    await page.goto("/seance");
    await expect(page.getByText(/Douleur importante signalée/)).toBeVisible();

    // Export JSON
    await page.goto("/profil");
    const [telechargement] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Exporter mes données" }).click()]);
    const contenu = JSON.parse(await readFile((await telechargement.path()) ?? "", "utf8"));
    expect(contenu.format).toBe("fitora-export-v1");
    expect(contenu.profil.prenom).toBe("Aïssatou");
    expect(contenu.journal_sante).toHaveLength(1);

    // Retrait du consentement : données de santé effacées
    await page.getByRole("button", { name: "Retirer mon consentement" }).click();
    await page.getByRole("button", { name: "Oui, retirer" }).click();
    await expect(page.getByRole("button", { name: "J’accepte le suivi de mes données de santé" })).toBeVisible();
    await page.goto("/sante");
    await expect(page.getByRole("button", { name: "J’accepte le suivi de mes données de santé" })).toBeVisible();
  });
});

test("progrès : mensuration, objectif et bilan", async ({ page }) => {
  await avecCompte(page, async () => {
    await page.goto("/progression");
    await expect(page.getByText(/Bilan de/)).toBeVisible();
    await page.getByLabel(/Valeur du jour/).fill("82");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Mesure enregistrée.")).toBeVisible();
    await expect(page.getByText(/1 mesure enregistrée/).first()).toBeVisible();

    await page.getByRole("combobox", { name: /^Objectif/ }).selectOption("hydratation");
    await page.getByLabel(/Cible/).fill("2000");
    await page.getByRole("button", { name: "Ajouter l’objectif" }).click();
    await expect(page.getByText("Eau par jour : 2 000 ml")).toBeVisible();
    await page.getByRole("button", { name: "Marquer comme atteint" }).click();
    await expect(page.getByText("Atteint", { exact: true })).toBeVisible();
  });
});

test("nutrition : journal du jour et plan de la semaine", async ({ page }) => {
  await avecCompte(page, async () => {
    await page.goto("/nutrition");
    await page.getByLabel("Aliment").selectOption("riz-blanc");
    await expect(page.getByLabel("Quantité (g)")).toHaveValue("200");
    await page.getByRole("button", { name: "Ajouter au journal" }).click();
    await expect(page.getByText("Riz blanc cuit · 200 g")).toBeVisible();
    await page.getByRole("button", { name: "Supprimer Riz blanc cuit" }).click();
    await expect(page.getByText("Aucun repas enregistré aujourd’hui.")).toBeVisible();

    await page.getByRole("button", { name: "Générer mon plan de la semaine" }).click();
    await expect(page.getByRole("tab", { name: "Lun" })).toBeVisible();
    await expect(page.getByText(/Total estimé/)).toBeVisible();
    await page.getByRole("tab", { name: "Liste de courses" }).click();
    await expect(page.getByRole("heading", { name: "Féculents" })).toBeVisible();
  });
});

test("suppression du compte avec mot de passe", async ({ page }) => {
  const compte = await creerUtilisateurConfirme("Moussa", "Diop");
  try {
    await completerProfil(compte.id);
    await seConnecter(page, compte.email);
    await page.goto("/profil");
    await page.getByRole("button", { name: "Supprimer mon compte" }).click();
    await page.getByLabel("Mot de passe", { exact: true }).last().fill("mauvais-mot");
    await page.getByLabel("Écris SUPPRIMER pour confirmer").fill("SUPPRIMER");
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    await expect(page.getByText("Mot de passe incorrect.").first()).toBeVisible();
    await page.getByLabel("Mot de passe", { exact: true }).last().fill(MOT_DE_PASSE_TEST);
    await page.getByRole("button", { name: "Supprimer définitivement" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Atteins tes objectifs" })).toBeVisible();
    // Le compte n'existe plus
    await page.goto("/connexion");
    await page.getByLabel("Email").fill(compte.email);
    await page.getByLabel("Mot de passe").fill(MOT_DE_PASSE_TEST);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
  } finally {
    await supprimerUtilisateur(compte.id).catch(() => undefined);
  }
});
