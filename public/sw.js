// Paths are relative to this file, so the app works at any address (localhost or GitHub Pages).
const CACHE = "hop-and-learn-v2";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["./", "./manifest.webmanifest"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    // Skip the browser's HTTP cache (GitHub Pages allows 10 minutes), so a new version shows on the next open.
    event.respondWith(fetch(request.url, { cache: "no-cache", credentials: "same-origin" }).then(response => {
      if (!response.ok) return response;
      return caches.open(CACHE).then(cache => cache.put("./", response.clone())).then(() => response);
    }).catch(async () => (await caches.match(request)) ?? (await caches.match("./"))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached ?? fetch(request).then(response => {
    if (!response.ok) return response;
    return caches.open(CACHE).then(cache => cache.put(request, response.clone())).then(() => response);
  })));
});
