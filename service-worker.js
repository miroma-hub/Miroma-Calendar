
const CACHE_NAME = 'miroma-cache-v5';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'miroma.png',
  'miroma.ico'
];

self.addEventListener('install', (event) => {
  // Força o Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tenta adicionar os arquivos. Usamos addAll aqui para garantir que 
        // falhas nos arquivos críticos (como ícones) interrompam o processo, 
        // forçando o navegador a tentar novamente de forma limpa.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Assume o controle das abas abertas imediatamente
  event.waitUntil(clients.claim());

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrar, senão busca na rede
        return response || fetch(event.request);
      })
  );
});
