const VERSION = 'pwa-full-v1';
const CACHE_NAME = `subliminal-full-${VERSION}`;

// Comprehensive assets for full offline PWA
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('subliminal-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Audio Bypass - Always bypass SW for audio to avoid memory/buffer issues
  const isMedia = 
    event.request.destination === 'audio' || 
    url.pathname.match(/\.(mp3|m4a|wav|aac|ogg|flac|webm|opus|blob)$/i) ||
    url.host.includes('blob') ||
    event.request.headers.get('Range');

  if (isMedia) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Navigation - Network-First with Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('index.html', clone));
          return response;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // 3. Asset Caching - Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
