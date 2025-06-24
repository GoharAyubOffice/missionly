// Service Worker for Push Notifications
// This handles background push notifications and click events

const CACHE_NAME = 'bounty-platform-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add other essential assets as needed
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        // Force activation
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let notificationData = {
    title: 'Bounty Platform',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'default',
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', payload);
      
      notificationData = {
        ...notificationData,
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        tag: payload.tag || notificationData.tag,
        data: {
          ...notificationData.data,
          ...payload.data,
          url: payload.url || notificationData.data.url,
          type: payload.type,
          id: payload.id
        },
        actions: payload.actions || notificationData.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  const showNotification = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      timestamp: Date.now()
    }
  );

  event.waitUntil(showNotification);
});

// Notification click event - handle user clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    console.log('[SW] Notification dismissed');
    return;
  }

  // Default action or 'view' action - open the app
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname)) {
          // Focus existing window
          return client.focus();
        }
      }
      
      // Open new window if app is not already open
      if (clients.openWindow) {
        const fullUrl = new URL(urlToOpen, self.location.origin).href;
        console.log('[SW] Opening URL:', fullUrl);
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
  
  // Optional: Track notification close events
  const data = event.notification.data || {};
  if (data.trackClose) {
    // Send analytics or tracking data
    fetch('/api/analytics/notification-close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: data.id,
        type: data.type,
        timestamp: Date.now()
      })
    }).catch(err => console.error('[SW] Failed to track notification close:', err));
  }
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      Promise.resolve()
    );
  }
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Fetch event - handle network requests (basic caching strategy)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache static assets
          if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
  );
});

console.log('[SW] Service worker script loaded');