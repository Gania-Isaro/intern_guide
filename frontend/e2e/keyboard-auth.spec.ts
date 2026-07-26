import { test, expect } from "@playwright/test";
import { statePath } from "./auth-helpers";

// Keyboard operability of the interactive star rating on the review form. It's
// an ARIA radio group, so arrow keys move and set the selection. Requires a
// logged-in student with an approved placement (seeded: aline @ company 1), so
// it runs only in the full-stack (same-origin API) mode.

test.use({ storageState: statePath("student") });

test("star ratings are settable with the keyboard (arrow keys)", async ({ page }) => {
  await page.goto("/reviews/new?company=1", { waitUntil: "networkidle" });

  // The first category ("Mentorship") is a labelled radio group.
  const group = page.getByRole("radiogroup", { name: "Mentorship" });
  await expect(group).toBeVisible();

  // Focus the group's first radio and step up with ArrowRight.
  await group.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowRight"); // -> 1 star
  await page.keyboard.press("ArrowRight"); // -> 2 stars
  await page.keyboard.press("ArrowRight"); // -> 3 stars

  // The 3-star radio is now the checked one.
  const third = group.getByRole("radio", { name: "3 stars" });
  await expect(third).toHaveAttribute("aria-checked", "true");
});
