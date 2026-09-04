const CACHE_NAME = 'leadengine-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add core assets silently - if they fail, don't crash the worker
      cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('Cache addAll error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests like Google Maps API scripts
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Network-first strategy for index.html to ensure live updates,
      // cache-first for other assets
      if (event.request.url.endsWith('/') || event.request.url.endsWith('index.html')) {
          return fetch(event.request).catch(() => cachedResponse);
      }
      return cachedResponse || fetch(event.request);
    })
  );
});
