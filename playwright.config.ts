import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Charge .env.local comme Next.js (variables Supabase).
loadEnvConfig(process.cwd());

const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}/connexion`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
