const VERSION = 'min-core-v1';
const CACHE_NAME = `subliminal-shell-${VERSION}`;

// Only cache critical UI assets
const SHELL_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
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

  // 1. STRATEGIC AUDIO BYPASS (CRITICAL for iOS Safari stability)
  // We explicitly bail out of SW logic for audio to let native engine handle range requests.
  const isMedia = 
    event.request.destination === 'audio' || 
    event.request.destination === 'video' ||
    url.pathname.match(/\.(mp3|m4a|wav|aac|ogg|flac|webm|opus|blob)$/i) ||
    url.host.includes('blob') ||
    event.request.headers.get('Range');

  if (isMedia) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Navigation Fallback (SPA Support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
    return;
  }

  // 3. Static Assets - Cache First
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((networkResponse) => {
        // Cache successful static asset fetches
        if (networkResponse.ok && networkResponse.status === 200 && !networkResponse.redirected) {
          const isStatic = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|json|woff2|ico)$/);
          if (isStatic) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
        }
        return networkResponse;
      });
    })
  );
});
