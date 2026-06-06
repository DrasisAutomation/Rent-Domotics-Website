/**
 * Cache Manager - Handles all caching operations for the dashboard
 * Uses IndexedDB for large data and localStorage for small data
 */

const CacheManager = (() => {
    const DB_NAME = 'RentDomoticsDashboard';
    const DB_VERSION = 1;
    const STORE_NAMES = {
        properties: 'properties',
        images: 'images',
        metadata: 'metadata'
    };

    const IMAGE_URLS = [
        './assets/1.webp',
        './assets/2.webp',
        './assets/3.webp',
        './assets/4.webp',
        './assets/5.webp',
        './assets/6.webp',
        './assets/10.webp'
    ];

    let db = null;

    /**
     * Initialize IndexedDB
     */
    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                
                if (!database.objectStoreNames.contains(STORE_NAMES.properties)) {
                    database.createObjectStore(STORE_NAMES.properties, { keyPath: 'id' });
                }
                if (!database.objectStoreNames.contains(STORE_NAMES.images)) {
                    database.createObjectStore(STORE_NAMES.images, { keyPath: 'url' });
                }
                if (!database.objectStoreNames.contains(STORE_NAMES.metadata)) {
                    database.createObjectStore(STORE_NAMES.metadata, { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Save property data to cache
     */
    async function saveProperty(propertyId, propertyData) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.properties], 'readwrite');
            const store = transaction.objectStore(STORE_NAMES.properties);
            const dataWithTimestamp = {
                id: propertyId,
                data: propertyData,
                timestamp: Date.now()
            };
            
            const request = store.put(dataWithTimestamp);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(dataWithTimestamp);
        });
    }

    /**
     * Get property data from cache
     */
    async function getProperty(propertyId) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.properties], 'readonly');
            const store = transaction.objectStore(STORE_NAMES.properties);
            const request = store.get(propertyId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Cache an image blob
     */
    async function cacheImage(url, blob) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.images], 'readwrite');
            const store = transaction.objectStore(STORE_NAMES.images);
            const data = {
                url: url,
                blob: blob,
                timestamp: Date.now(),
                size: blob.size
            };

            const request = store.put(data);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(data);
        });
    }

    /**
     * Get cached image blob
     */
    async function getCachedImage(url) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.images], 'readonly');
            const store = transaction.objectStore(STORE_NAMES.images);
            const request = store.get(url);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Preload all dashboard images
     */
    async function preloadImages() {
        const preloadPromises = IMAGE_URLS.map(async (url) => {
            try {
                // Check if already cached
                const cached = await getCachedImage(url);
                if (cached) {
                    console.log(`[Cache] Image already cached: ${url}`);
                    return cached;
                }

                // Fetch and cache image
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                
                const blob = await response.blob();
                const cached = await cacheImage(url, blob);
                console.log(`[Cache] Image cached: ${url} (${Math.round(cached.size / 1024)}KB)`);
                return cached;
            } catch (error) {
                console.warn(`[Cache] Failed to cache image ${url}:`, error);
                return null;
            }
        });

        return Promise.all(preloadPromises);
    }

    /**
     * Get image from cache or network
     */
    async function getImage(url) {
        try {
            const cached = await getCachedImage(url);
            if (cached) {
                const objectUrl = URL.createObjectURL(cached.blob);
                return objectUrl;
            }
        } catch (error) {
            console.warn(`[Cache] Error retrieving cached image:`, error);
        }

        // Fallback to network
        return url;
    }

    /**
     * Set metadata (for tracking expiration checks, etc.)
     */
    async function setMetadata(key, value) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.metadata], 'readwrite');
            const store = transaction.objectStore(STORE_NAMES.metadata);
            const data = {
                key: key,
                value: value,
                timestamp: Date.now()
            };

            const request = store.put(data);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(data);
        });
    }

    /**
     * Get metadata
     */
    async function getMetadata(key) {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAMES.metadata], 'readonly');
            const store = transaction.objectStore(STORE_NAMES.metadata);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Check if data is still fresh (within cache duration)
     */
    function isCacheFresh(timestamp, maxAgeMs = 5 * 60 * 1000) {
        return Date.now() - timestamp < maxAgeMs;
    }

    /**
     * Clear all cache
     */
    async function clearCache() {
        if (!db) await initDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORE_NAMES.properties, STORE_NAMES.images, STORE_NAMES.metadata],
                'readwrite'
            );

            const clearPromises = [
                new Promise((res) => {
                    const request = transaction.objectStore(STORE_NAMES.properties).clear();
                    request.onsuccess = res;
                }),
                new Promise((res) => {
                    const request = transaction.objectStore(STORE_NAMES.images).clear();
                    request.onsuccess = res;
                }),
                new Promise((res) => {
                    const request = transaction.objectStore(STORE_NAMES.metadata).clear();
                    request.onsuccess = res;
                })
            ];

            Promise.all(clearPromises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    /**
     * Get cache statistics
     */
    async function getCacheStats() {
        if (!db) await initDB();

        return new Promise((resolve) => {
            const transaction = db.transaction([STORE_NAMES.images], 'readonly');
            const store = transaction.objectStore(STORE_NAMES.images);
            let totalSize = 0;
            let imageCount = 0;

            const request = store.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    imageCount++;
                    totalSize += cursor.value.size;
                    cursor.continue();
                } else {
                    resolve({
                        imageCount,
                        totalSize,
                        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
                    });
                }
            };
        });
    }

    return {
        initDB,
        saveProperty,
        getProperty,
        cacheImage,
        getCachedImage,
        getImage,
        preloadImages,
        setMetadata,
        getMetadata,
        isCacheFresh,
        clearCache,
        getCacheStats,
        IMAGE_URLS
    };
})();

// Auto-initialize DB on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CacheManager.initDB());
} else {
    CacheManager.initDB();
}
