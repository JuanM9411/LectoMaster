const CACHE_NAME = 'lectomaster-v10';
const URLS_TO_CACHE = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fallback to cache (for offline)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  
  // Skip Firebase and external API requests from cache
  if (e.request.url.includes('firebaseio.com') || 
      e.request.url.includes('googleapis.com/identitytoolkit')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
