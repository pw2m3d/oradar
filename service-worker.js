// ORadar PWA: caches only UI resources, never live weather/disaster/currency API responses.
const CACHE_NAME = 'oradar-shell-v0.2';
const SHELL_URLS = [
  '/', '/index.html', '/styles.css', '/app.js', '/favicon.svg',
  '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png',
  '/icons/icon-maskable-192.png', '/icons/icon-maskable-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(SHELL_URLS))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('oradar-shell-') && key !== CACHE_NAME)
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match('/index.html')) || Response.error()));
    return;
  }
  if (!SHELL_URLS.includes(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
