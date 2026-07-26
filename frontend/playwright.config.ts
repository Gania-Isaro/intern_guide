import { defineConfig, devices } from "@playwright/test";

// Accessibility (and future E2E) tests. `npm run build && npm start` serves the
// app on :3000; in CI we start it the same way via the webServer block below.
const PORT = 3000;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  // E2E_AUTH=1 (full-stack, same-origin API) runs the authenticated specs too;
  // otherwise only the public specs run - e.g. CI against the cross-site prod
  // API, where logging in can't set a cookie.
  projects: process.env.E2E_AUTH
    ? [
        // logs in each role and saves session state; runs before the main project
        { name: "setup", testMatch: /auth\.setup\.ts/ },
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
          dependencies: ["setup"],
        },
      ]
    : [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
          // skip the authenticated specs (*-auth.spec.ts)
          testIgnore: /-auth\.spec\.ts$/,
        },
      ],
  // Only spin up a server when testing localhost. If BASE_URL points elsewhere
  // (e.g. prod), we test that instead and start nothing.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run start",
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
