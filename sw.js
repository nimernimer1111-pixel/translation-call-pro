// TranslationCall Pro - Service Worker
const CACHE_NAME = 'translationcall-v1';
const ASSETS = [
  '/translation-call-pro/',
  '/translation-call-pro/index.html',
  '/translation-call-pro/learn.html',
  '/translation-call-pro/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.log('Cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Skip non-GET and socket.io requests
  if(event.request.method !== 'GET') return;
  if(event.request.url.includes('socket.io')) return;
  if(event.request.url.includes('translate.googleapis')) return;
  if(event.request.url.includes('generativelanguage')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if(response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if offline
        return caches.match(event.request);
      })
  );
});
