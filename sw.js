// Service worker do app de coleta: guarda a própria página para abrir sem internet.
// (Os blocos de satélite ficam no IndexedDB, controlados pela página.)
const CACHE = 'tp-coleta-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./']).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(r, copia));
        return res;
      })
      .catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || caches.match('./')))
  );
});
