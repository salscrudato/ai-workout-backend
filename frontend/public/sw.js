// Advanced Service Worker for AI Workout App
const CACHE_VERSION = '2.0.0';
const STATIC_CACHE = `ai-workout-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ai-workout-dynamic-v${CACHE_VERSION}`;
const API_CACHE = `ai-workout-api-v${CACHE_VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Static resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add critical CSS and JS files here
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/v1/equipment',
  '/v1/profile',
  '/v1/workouts'
];

// Install event - cache static resources and set up caches
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activation complete');
    })
  );
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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
    event.respondWith(handleHTMLRequest(request));
  } else {
    event.respondWith(handleDynamicResource(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'workout-completion') {
    event.waitUntil(syncWorkoutCompletions());
  }
});

// Push notifications for workout reminders
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Time for your workout!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
        icon: '/icons/start-workout.png'
      },
      {
        action: 'snooze',
        title: 'Remind me later',
        icon: '/icons/snooze.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AI Workout Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);

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
        icon: '/icons/icon-192x192.png'
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
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
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
    console.error('Static resource fetch failed:', error);
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
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache for HTML');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page as last resort
    return caches.match('/offline.html');
  }
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
        console.error('Failed to sync workout completion:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}



// IndexedDB helpers (simplified - would need full implementation)
async function getPendingWorkoutCompletions() {
  // Implementation would use IndexedDB to get pending items
  return [];
}

async function removePendingWorkoutCompletion(id) {
  // Implementation would remove item from IndexedDB
  console.log('Removing pending completion:', id);
}
