import { test, expect } from "@playwright/test";

// Keyboard-operability checks for the bespoke navigation behaviours added for
// accessibility. axe validates static semantics; these validate interaction.
// Public (no login) - the authenticated star-rating check lives in
// keyboard-auth.spec.ts.

test("skip link is the first tab stop and jumps to main content", async ({ page }) => {
  await page.goto("/");

  // First Tab from the top of the page lands on the skip link.
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();

  // Activating it moves focus to the <main> region.
  await page.keyboard.press("Enter");
  const main = page.locator("#main-content");
  await expect(main).toBeFocused();
});

test("mobile menu button exposes and toggles its expanded state", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  // Operable by keyboard: focus it and press Enter.
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");

  const closeToggle = page.getByRole("button", { name: "Close menu" });
  await expect(closeToggle).toHaveAttribute("aria-expanded", "true");

  // The menu it controls is now visible and links are reachable.
  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Companies" })).toBeVisible();
});
