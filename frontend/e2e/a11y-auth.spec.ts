import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { statePath } from "./auth-helpers";

// Accessibility scan of the LOGGED-IN pages, one block per role using the
// session saved by auth.setup.ts. Together with a11y.spec.ts (public pages),
// this covers every route in the app.

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoViolations(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}) - ${v.help}`);
  expect(summary, `${path}\n${summary.join("\n")}`).toEqual([]);
}

// pages any signed-in user can reach
const SHARED_PAGES = ["/account", "/dashboard"];

const STUDENT_PAGES = [
  ...SHARED_PAGES,
  "/saved",
  "/my-placements",
  "/my-reviews",
  "/verify",
  "/reviews/new?company=1",
];
const OWNER_PAGES = [...SHARED_PAGES, "/owner", "/owner/company", "/owner/register"];
const ADMIN_PAGES = [
  ...SHARED_PAGES,
  "/admin",
  "/admin/companies",
  "/admin/companies/1/edit",
];

test.describe("student pages", () => {
  test.use({ storageState: statePath("student") });
  for (const path of STUDENT_PAGES) {
    test(`no WCAG A/AA violations: ${path}`, async ({ page }) => {
      await expectNoViolations(page, path);
    });
  }
});

test.describe("company owner pages", () => {
  test.use({ storageState: statePath("owner") });
  for (const path of OWNER_PAGES) {
    test(`no WCAG A/AA violations: ${path}`, async ({ page }) => {
      await expectNoViolations(page, path);
    });
  }
});

test.describe("admin pages", () => {
  test.use({ storageState: statePath("admin") });
  for (const path of ADMIN_PAGES) {
    test(`no WCAG A/AA violations: ${path}`, async ({ page }) => {
      await expectNoViolations(page, path);
    });
  }
});
