// Advanced Service Worker for AI Workout App
const IS_DEV = self.location.hostname === 'localhost';
const log = (...args) => { if (IS_DEV) console.log('[SW]', ...args); };

const CACHE_VERSION = '2.1.0';
const STATIC_CACHE = `ai-workout-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ai-workout-dynamic-v${CACHE_VERSION}`;
const API_CACHE = `ai-workout-api-v${CACHE_VERSION}`;

// SPA app shell routes & critical assets
const APP_SHELL_ROUTES = ['/', '/dashboard', '/generate', '/history', '/profile'];
const CRITICAL_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

const STATIC_RESOURCES = [
  ...APP_SHELL_ROUTES,
  ...CRITICAL_ASSETS,
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/v1/equipment',
  '/v1/profile',
  '/v1/workouts'
];

// Install event - cache static resources and set up caches
self.addEventListener('install', (event) => {
  log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then(async (cache) => {
        log('📦 Precaching static resources');
        try {
          await cache.addAll(STATIC_RESOURCES);
        } catch (e) {
          // Best-effort in dev; some routes may 404 during local builds
          log('⚠️ Precaching encountered issues (best-effort):', e);
          for (const url of STATIC_RESOURCES) {
            try { await cache.add(url); } catch {}
          }
        }
      }),
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      log('✅ Service Worker installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  log('🚀 Service Worker activating...');

  event.waitUntil((async () => {
    await Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
            log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )),
    ]);
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
    log('✅ Service Worker activation complete');
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Support navigation preload response
  const preloadResponse = event.preloadResponse ? event.preloadResponse : null;

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticResource(url)) {
    event.respondWith(handleStaticResource(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isHTMLRequest(request)) {
    event.respondWith(handleHTMLRequestWithEvent(event, request));
  } else {
    event.respondWith(handleDynamicResource(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'workout-completion') {
    event.waitUntil(syncWorkoutCompletions());
  }
});

// Push notifications for workout reminders
self.addEventListener('push', (event) => {
  log('📱 Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Time for your workout!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
      },
      {
        action: 'snooze',
        title: 'Remind me later',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AI Workout Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  log('🔔 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'start-workout') {
    event.waitUntil(
      clients.openWindow('/generate')
    );
  } else if (event.action === 'snooze') {
    // Schedule another notification in 30 minutes
    setTimeout(() => {
      self.registration.showNotification('Workout Reminder', {
        body: 'Ready for your workout now?',
        icon: '/icon-192x192.png'
      });
    }, 30 * 60 * 1000);
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function isStaticResource(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|ico|json|webmanifest)$/.test(url.pathname);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/v1/') ||
         url.hostname !== self.location.hostname;
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Cache-first strategy for static resources
async function handleStaticResource(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    log('Static resource fetch failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Stale-while-revalidate for API requests
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  const responsePromise = cachedResponse || fetch(request).catch(() => {
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  });

  // Update cache in background
  if (shouldCacheAPI(request.url)) {
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {
      // Silently fail background updates
    });
  }

  return responsePromise;
}

// Network-first for HTML requests with offline fallback
async function handleHTMLRequest(request) {
  try {
    // Use navigation preload if available
    const preload = await (self.registration.navigationPreload ? self.registration.navigationPreload.getState().then(s => s.enabled ? request : null).catch(() => null) : null);
    const response = (preload && (await event?.preloadResponse)) || await fetch(request, { credentials: 'same-origin' });

    if (response && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    log('🌐 Network failed, trying cache for HTML');

    // Try cached request
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Fallback to app shell (index.html) for SPA navigations
    const shell = await caches.match('/index.html');
    if (shell) return shell;

    // Last resort: offline page
    return caches.match('/offline.html');
  }
}

async function handleHTMLRequestWithEvent(event, request) {
  try {
    const preloadResp = event.preloadResponse ? await event.preloadResponse : null;
    if (preloadResp) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, preloadResp.clone());
      return preloadResp;
    }
  } catch {}
  return handleHTMLRequest(request);
}

// Dynamic resource handling
async function handleDynamicResource(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Resource not available offline', {
      status: 503
    });
  }
}

function shouldCacheAPI(url) {
  return CACHEABLE_APIS.some(api => url.includes(api));
}

// Background sync functions
async function syncWorkoutCompletions() {
  try {
    // Get pending workout completions from IndexedDB
    const pendingCompletions = await getPendingWorkoutCompletions();

    for (const completion of pendingCompletions) {
      try {
        await fetch('/v1/workouts/' + completion.workoutId + '/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + completion.token
          },
          body: JSON.stringify(completion.data)
        });

        // Remove from pending list
        await removePendingWorkoutCompletion(completion.id);
      } catch (error) {
        log('Failed to sync workout completion:', error);
      }
    }
  } catch (error) {
    log('Background sync failed:', error);
  }
}



// IndexedDB helpers (simplified - would need full implementation)
async function getPendingWorkoutCompletions() {
  // Implementation would use IndexedDB to get pending items
  return [];
}

async function removePendingWorkoutCompletion(id) {
  // Implementation would remove item from IndexedDB
  log('Removing pending completion:', id);
}
