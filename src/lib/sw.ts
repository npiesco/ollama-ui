import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, type SerwistGlobalConfig, Serwist, NetworkFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Custom cache for model data
const modelCache = "ollama-model-cache";

// Initialize Serwist with our configuration
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: /^https:\/\/api\.ollama\.ai\/.*$/i,
      handler: new NetworkFirst({
        cacheName: "ollama-api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          })
        ]
      })
    }
  ]
});

// Start Serwist
serwist.addEventListeners();

// Handle messages from the ServiceWorkerManager
self.addEventListener('message', (event) => {
  const data = event.data;

  switch (data.type) {
    case 'NETWORK_STATUS':
      // Handle online/offline status changes
      console.log('Network status changed:', data.isOnline);
      break;

    case 'CACHE_MODEL':
      // Cache model data
      caches.open(modelCache).then((cache) => {
        const modelBlob = new Blob([JSON.stringify(data.modelData)], {
          type: 'application/json'
        });
        cache.put(`/model/${data.modelId}`, new Response(modelBlob));
      });
      break;

    case 'CLEAR_MODEL_CACHE':
      // Clear model cache
      caches.delete(modelCache);
      break;
  }
});

// Handle fetch events for model data
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/models/")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
}); 