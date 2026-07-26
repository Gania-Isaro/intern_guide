import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import { PASSWORD, ROLES, authDir, statePath, type Role } from "./auth-helpers";

// Logs in once per role and saves the browser session (cookies) to disk, so the
// authenticated accessibility specs can reuse it without logging in repeatedly
// (which would also trip the login rate limiter).
//
// This only works when the API is same-site with the frontend (both localhost),
// so the auth cookie is stored. Against a cross-site API (e.g. prod from CI)
// login can't persist - those runs skip the authenticated specs.

fs.mkdirSync(authDir, { recursive: true });

for (const [role, email] of Object.entries(ROLES)) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", email);
    await page.fill("#password", PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();

    // A successful login redirects off /login and the navbar shows a Log out
    // control. Wait for that so we know the session cookie is set.
    await expect(page.getByRole("button", { name: "Log out" }).first()).toBeVisible({
      timeout: 15_000,
    });

    await page.context().storageState({ path: statePath(role as Role) });
  });
}
