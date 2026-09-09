// MessOS — basic offline app-shell cache.
// Sirf app ki apni files aur CDN script cache karta hai; Supabase ka live data
// kabhi cache nahi hota, taaki purana data "fresh" jaisa dikh kar confuse na kare.
const CACHE = 'messos-shell-v1';
const CACHEABLE_ORIGINS = [self.location.origin, 'https://cdn.jsdelivr.net'];

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!CACHEABLE_ORIGINS.includes(url.origin)) return; // Supabase calls etc — network only

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
