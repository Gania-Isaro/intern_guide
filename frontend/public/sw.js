/*
 * InternGuide service worker - gives the app offline support.
 *
 * Strategy by request type:
 *   - Page navigations : network-first, fall back to the cached page, then to
 *                        a branded /offline.html. So pages you've opened before
 *                        still work with no signal.
 *   - Static assets    : stale-while-revalidate (instant from cache, refreshed
 *     (_next, icons)     in the background) - faster repeat loads, less data.
 *   - API GETs         : stale-while-revalidate too, so companies/reviews you've
 *                        already viewed stay readable offline.
 *   - Anything else     : straight to the network (never cache POST/auth/etc).
 */

const VERSION = "v1";
const APP_CACHE = `ig-app-${VERSION}`; // pages + static assets
const API_CACHE = `ig-api-${VERSION}`; // API GET responses
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

// The API origin whose GET responses we cache for offline reading.
const API_ORIGIN = "https://api.gania.tech";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== APP_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k)) // drop caches from older versions
        )
      )
      .then(() => self.clients.claim())
  );
});

// cache-first-then-update: return cache immediately, refresh it in the background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

// network-first for pages: fresh when online, cached page (or offline page) when not
async function pageHandler(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || (await cache.match(OFFLINE_URL));
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never cache mutations

  const url = new URL(request.url);

  // 1. page navigations
  if (request.mode === "navigate") {
    event.respondWith(pageHandler(request));
    return;
  }

  // 2. our API's GET responses (companies, reviews you've viewed)
  if (url.origin === API_ORIGIN) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // 3. same-origin static assets (Next chunks, icons, fonts, images)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
    return;
  }

  // 4. everything else: let the network handle it
});
