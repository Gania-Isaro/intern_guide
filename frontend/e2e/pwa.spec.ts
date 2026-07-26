import { test, expect } from "@playwright/test";

// Verifies the PWA/offline behaviour end to end. These run in public mode (no
// login) but need the SERVICE WORKER, which only registers in a production
// build served by `npm start` (how the webServer + CI run it).

test("web manifest is served and installable", async ({ page, request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.name).toBe("InternGuide");
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBe("/");
  // at least one 512 icon + a maskable one (install requirements)
  expect(m.icons.some((i: { sizes: string }) => i.sizes === "512x512")).toBeTruthy();
  expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBeTruthy();
});

test("service worker registers and controls the page", async ({ page }) => {
  await page.goto("/");
  const controlled = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  });
  expect(controlled).toBeTruthy();
});

test("shows the offline page for an un-visited route when offline", async ({ page, context }) => {
  // prime the service worker
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);

  // go offline and navigate somewhere not cached yet
  await context.setOffline(true);
  await page.goto("/how-it-works").catch(() => {});
  await expect(page.getByText("You're offline")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

  await context.setOffline(false);
});

test("a page viewed online still works offline", async ({ page, context }) => {
  // first load registers the SW (this navigation itself isn't controlled yet)
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);

  // now the SW controls the page: visiting /companies caches the page + its data
  await page.goto("/companies", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000); // let the SW store the responses

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });

  // the cached companies page renders (not the offline fallback)
  await expect(page.getByRole("heading", { name: "Browse companies" })).toBeVisible();

  await context.setOffline(false);
});

test("the Download app button appears and triggers the install prompt", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // By default (no install event, not iOS) the button is hidden.
  await expect(page.getByRole("button", { name: "Download app" })).toHaveCount(0);

  // Simulate the browser's install event (with a spy on prompt()). Retry so we
  // don't race React hydration attaching the listener.
  await expect(async () => {
    await page.evaluate(() => {
      const e = new Event("beforeinstallprompt") as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: string }>;
      };
      (window as unknown as { __promptCalled?: boolean }).__promptCalled = false;
      e.prompt = () => {
        (window as unknown as { __promptCalled?: boolean }).__promptCalled = true;
        return Promise.resolve();
      };
      e.userChoice = Promise.resolve({ outcome: "accepted" });
      window.dispatchEvent(e);
    });
    await expect(page.getByRole("button", { name: "Download app" }).first()).toBeVisible({
      timeout: 1000,
    });
  }).toPass();

  // Clicking it calls the native prompt.
  await page.getByRole("button", { name: "Download app" }).first().click();
  const prompted = await page.evaluate(
    () => (window as unknown as { __promptCalled?: boolean }).__promptCalled
  );
  expect(prompted).toBe(true);
});

test("an offline banner appears when the connection drops", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const banner = page.getByText("You're offline - showing saved pages");

  // Playwright's setOffline doesn't flip navigator.onLine, so drive the banner
  // through the browser's own offline event (what the component listens to).
  // Retry the dispatch until it lands, so we don't race React hydration.
  await expect(async () => {
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(banner).toBeVisible({ timeout: 1000 });
  }).toPass();

  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(banner).toHaveCount(0);
});
