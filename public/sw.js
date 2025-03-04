const CACHE_NAME = 'ollama-ui-v1';
const MODEL_CACHE_NAME = 'ollama-models-v1';

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
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(MODEL_CACHE_NAME).then((cache) => {
        // Initialize model cache
        return cache;
      })
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== MODEL_CACHE_NAME)
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
      (async () => {
        try {
          // Try network first
          const response = await fetch(event.request);
          return response;
        } catch (error) {
          // If offline, check cache
          const cache = await caches.open(MODEL_CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If no cached response, return offline fallback
          return new Response(JSON.stringify({
            error: 'Offline mode: No cached response available',
            offline: true
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
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

// Handle offline status and model caching
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CACHE_MODEL') {
    // Cache model data
    const { modelId, modelData } = event.data;
    caches.open(MODEL_CACHE_NAME).then((cache) => {
      cache.put(`/api/models/${modelId}`, new Response(JSON.stringify(modelData), {
        headers: { 'Content-Type': 'application/json' }
      }));
    });
  }
}); 