const CACHE_NAME = 'seafarer-calc-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install Event - Pre-cache shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network First for HTML navigation, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  
  // Never intercept Vite dev server requests or source files
  if (
    url.pathname.startsWith('/@') || 
    url.pathname.startsWith('/src') || 
    url.pathname.startsWith('/node_modules') ||
    url.search.includes('v=') ||
    url.search.includes('import')
  ) {
    return;
  }
  
  if (url.origin === self.location.origin) {
    // For navigation/HTML requests, always try network first so user gets latest app assets
    if (e.request.mode === 'navigate') {
      e.respondWith(
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
      );
      return;
    }

    // Static assets (JS/CSS/Images)
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
