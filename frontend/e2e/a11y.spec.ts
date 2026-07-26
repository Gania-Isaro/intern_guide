import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Runtime accessibility scan. axe-core checks the rendered DOM against WCAG 2.0
// and 2.1 A/AA rules (contrast, names/roles/values, ARIA validity, landmarks,
// labels, etc.) - the things a static linter can't see. Any violation on a
// scanned page fails the build.

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations;
}

// Public pages reachable without logging in. These cover the shared shell
// (navbar, footer, skip link), the design tokens (contrast), forms (login,
// register, verify-email, forgot-password), and the company detail page with
// its rating widgets and map.
const PUBLIC_PAGES = [
  "/",
  "/companies",
  "/companies/1",
  "/compare?ids=1,2",
  "/how-it-works",
  "/employers",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
];

for (const path of PUBLIC_PAGES) {
  test(`no WCAG A/AA violations: ${path}`, async ({ page }) => {
    const violations = await scan(page, path);
    // Surface a readable summary if it fails, instead of a bare object dump.
    const summary = violations.map((v) => `${v.id} (${v.impact}) - ${v.help}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

// The mobile navigation menu is hidden until opened; scan it in its open state
// so its links and the expanded hamburger button are checked too.
test("no WCAG A/AA violations: mobile menu open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}) - ${v.help}`);
  expect(summary, summary.join("\n")).toEqual([]);
});
