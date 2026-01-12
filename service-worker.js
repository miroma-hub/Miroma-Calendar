
const CACHE_NAME = 'miroma-cache-v4';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'miroma.png',
  'miroma.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tenta adicionar todos, mas não quebra o registro se um falhar (útil em ambientes de preview)
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url))
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
