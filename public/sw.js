const VERSION = 'ultra-v2.4.3'; 
const CACHE_NAME = `subliminal-ultra-${VERSION}`;

// Platform Detection (Internal)
const isIOS = /iPad|iPhone|iPod/.test(self.navigator.userAgent);

// Assets to cache (UI Shell)
const SHELL_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.ico',
];

// Install: Skip waiting for immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[SW] Pre-caching shell in ${isIOS ? 'Safe' : 'Full'} mode`);
      return cache.addAll(SHELL_ASSETS);
    })
  );
});

// Activate: Cleanup old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: The Hybrid Engine
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. GLOBAL BYPASS RULES
  if (event.request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/@vite') || url.pathname.includes('hot-update')) return;

  // 2. AUDIO & MEDIA BYPASS (CRITICAL: Never intercept audio)
  // This allows native Apple media engine to handle range requests without SW interference
  const isMedia = 
    event.request.destination === 'audio' || 
    event.request.destination === 'video' ||
    url.pathname.match(/\.(mp3|m4a|wav|aac|ogg|flac|webm|opus|blob|m4r|mp4|m3u8|ts)$/i) ||
    url.host.includes('blob') ||
    event.request.headers.get('Range') ||
    event.request.headers.get('Accept')?.includes('audio/');

  if (isMedia) {
    // ALWAYS use direct network fetch for media
    event.respondWith(fetch(event.request));
    return;
  }

  // 3. NAVIGATION (SPA Fallback)
  if (event.request.mode === 'navigate') {
    if (isIOS) {
      // iOS Safe Mode: Prefer network, fallback to cached shell
      event.respondWith(
        fetch(event.request)
          .then(res => {
            if (res.ok && !res.redirected) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(c => c.put('index.html', clone));
            }
            return res;
          })
          .catch(() => caches.match('index.html'))
      );
    } else {
      // Full PWA Mode: Network-first with cache update
      event.respondWith(
        fetch(event.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put('index.html', clone));
            return res;
          })
          .catch(() => caches.match('index.html'))
      );
    }
    return;
  }

  // 4. STATIC ASSETS
  const isStatic = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2|json|ico|webmanifest)$/);
  
  if (isStatic) {
    if (isIOS) {
      // iOS Safe Mode: Cache-First for shell assets only (others direct)
      event.respondWith(
        caches.match(event.request).then(cached => {
          return cached || fetch(event.request);
        })
      );
    } else {
      // Full PWA Mode: Stale-While-Revalidate
      event.respondWith(
        caches.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(res => {
            if (res.ok && res.status === 200 && !res.redirected) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            }
            return res;
          }).catch(() => null);
          return cached || fetchPromise;
        })
      );
    }
    return;
  }
});

// SELF-HEALING & DIAGNOSTICS
self.addEventListener('message', (event) => {
  if (event.data === 'HEAL_CACHE') {
    console.log('[SW] Cache healing triggered');
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS));
  }
});

