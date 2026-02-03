/**
 * CARAG Service Worker
 * 
 * Provides offline support, caching strategies, and background sync.
 */

const CACHE_NAME = 'carag-v1';
const STATIC_CACHE = 'carag-static-v1';
const API_CACHE = 'carag-api-v1';
const IMAGE_CACHE = 'carag-images-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/compare',
    '/terms',
    '/disclaimer',
    '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (![STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(cacheName)) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // API requests - Network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, API_CACHE));
        return;
    }

    // Images - Cache first, network fallback
    if (request.destination === 'image') {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Static assets - Stale while revalidate
    if (request.destination === 'script' || 
        request.destination === 'style' ||
        request.destination === 'font') {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // HTML pages - Network first with offline fallback
    if (request.destination === 'document') {
        event.respondWith(networkFirstWithOfflineFallback(request));
        return;
    }

    // Default - Network first
    event.respondWith(networkFirst(request, CACHE_NAME));
});

/**
 * Network First strategy
 * Try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, serving from cache');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Cache First strategy
 * Serve from cache, update in background
 */
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
                caches.open(cacheName).then((cache) => {
                    cache.put(request, networkResponse);
                });
            }
        }).catch(() => {});
        
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

/**
 * Stale While Revalidate strategy
 * Serve from cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    // Always fetch from network to update cache
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const cache = caches.open(cacheName);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => null);
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    const networkResponse = await fetchPromise;
    if (networkResponse) {
        return networkResponse;
    }
    
    throw new Error('Resource not available offline');
}

/**
 * Network First with Offline Fallback
 * For HTML pages
 */
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('[SW] Serving offline fallback');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Ultimate fallback
        return new Response(
            '<html><body><h1>Offline</h1><p>You are offline and this page is not cached.</p></body></html>',
            { 
                status: 503, 
                headers: { 'Content-Type': 'text/html' } 
            }
        );
    }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncFormSubmissions());
    }
});

async function syncFormSubmissions() {
    // Implement background sync for any queued form submissions
    console.log('[SW] Background sync executed');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'New update from CARAG',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'carag-notification',
        requireInteraction: false,
    };
    
    event.waitUntil(
        self.registration.showNotification('CARAG', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
