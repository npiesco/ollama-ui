const CACHE_NAME = 'ollama-ui-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/llama.svg',
  '/welcome-llama.svg',
  '/window.svg',
  '/file.svg',
  '/next.svg',
  '/vercel.svg',
  '/globe.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests to Ollama
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return cached response if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Cache new static assets
          if (response.ok && STATIC_ASSETS.includes(url.pathname)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
  );
});

// Handle offline status
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 