const CACHE_NAME = 'devsocial-v3'; // Bumped to clear old cache
const urlsToCache = [
  '/home',
  '/leaderboard',
  '/challenges',
  '/dashboard',
  '/profile',
  '/offline'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip service worker for root path to allow redirects
  if (url.pathname === '/') {
    return;
  }
  
  // NEVER cache API requests - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Network-first strategy for dynamic pages
  const dynamicPages = ['/home', '/dashboard', '/profile', '/leaderboard'];
  if (dynamicPages.some(page => url.pathname.startsWith(page))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response but always fetch fresh first
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request)) // Fallback to cache only if offline
    );
    return;
  }
  
  // Cache-first for static assets only
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => caches.match('/offline'))
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Handle plain text from DevTools test
    data = { title: 'DevSocial', body: event.data ? event.data.text() : 'New notification' };
  }
  
  const title = data.title || 'DevSocial';
  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: data.image,
    data: {
      url: data.url || data.actionUrl || '/',
      notificationId: data.notificationId
    },
    tag: data.tag || 'devsocial-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
