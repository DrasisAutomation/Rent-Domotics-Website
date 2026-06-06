/**
 * Service Worker for RentDomotics Dashboard
 * Provides offline-first caching and instant page navigation
 */

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
    static: `static-${CACHE_VERSION}`,
    dynamic: `dynamic-${CACHE_VERSION}`,
    images: `images-${CACHE_VERSION}`
};

async function cacheResponse(request, response, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
    } catch (error) {
        console.warn('[ServiceWorker] cache.put failed for', request.url, cacheName, error);
    }
}

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/control.html',
    '/floorplan.html',
    '/service.html',
    '/order.html',
    '/complaints.html',
    '/facility.html',
    '/upcoming-events.html',
    '/styles.css',
    '/project/control.css',
    '/project/config.js',
    '/project/auth-state-manager.js',
    '/project/firebase-config.js',
    '/project/cache-manager.js',
    '/project/button-control.js',
    '/project/dimmer.js',
    '/project/switch.js',
    '/project/lock.js',
    '/project/cct-light-card.js',
    '/project/main-control.js',
    '/project/ping.js',
    '/project/universal-auth.js'
];

const IMAGE_ASSETS = [
    '/assets/1.webp',
    '/assets/2.webp',
    '/assets/3.webp',
    '/assets/4.webp',
    '/assets/5.webp',
    '/assets/6.webp',
    '/assets/10.webp'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAMES.static)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS).catch((error) => {
                    console.warn('[ServiceWorker] Some static assets failed to cache:', error);
                    // Don't fail installation if some assets fail
                });
            })
            .then(() => {
                console.log('[ServiceWorker] Caching images');
                return caches.open(CACHE_NAMES.images)
                    .then((cache) => {
                        return cache.addAll(IMAGE_ASSETS).catch((error) => {
                            console.warn('[ServiceWorker] Some images failed to cache:', error);
                        });
                    });
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

/**
 * Fetch event - implement caching strategy
 * Strategy: Cache First for images and static assets, Network First for dynamic content
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external URLs
    if (url.origin !== location.origin) {
        return;
    }

    // Strategy 1: Cache First for images and static assets
    if (request.url.includes('/assets/') || /\.(webp|png|jpg|jpeg|gif|svg|woff|woff2)$/i.test(request.url)) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('[SW-Cache] Hit:', request.url);
                        return response;
                    }

                    return fetch(request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                const cacheName = /\.webp|\.png|\.jpg/.test(request.url)
                                    ? CACHE_NAMES.images
                                    : CACHE_NAMES.static;
                                event.waitUntil(cacheResponse(request, response, cacheName));
                            }
                            return response;
                        })
                        .catch(() => {
                            return caches.match(request).then((cachedResponse) => {
                                return cachedResponse || new Response('Resource unavailable', { status: 404 });
                            });
                        });
                })
        );
        return;
    }

    // Strategy 2: Network First for HTML pages and dynamic content
    if (request.mode === 'navigate' || /\.html$/.test(request.url)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        event.waitUntil(cacheResponse(request, response, CACHE_NAMES.dynamic));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then((response) => {
                            return response || new Response(
                                'Sorry, the page is not available offline',
                                { status: 503 }
                            );
                        });
                })
        );
        return;
    }

    // Strategy 3: Network First for JS and CSS
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.status === 200) {
                    event.waitUntil(cacheResponse(request, response, CACHE_NAMES.static));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request)
                    .catch(() => new Response('Resource unavailable', { status: 404 }));
            })
    );
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[ServiceWorker] Clearing all caches');
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        });
    }

    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        caches.keys().then((cacheNames) => {
            const stats = {};
            Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.open(cacheName).then((cache) => {
                        return cache.keys().then((requests) => {
                            stats[cacheName] = requests.length;
                        });
                    });
                })
            ).then(() => {
                event.ports[0].postMessage(stats);
            });
        });
    }
});
