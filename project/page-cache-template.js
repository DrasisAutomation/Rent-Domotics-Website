/**
 * Template for applying caching to other dashboard pages
 * Copy this snippet into your HTML pages (control.html, service.html, etc.)
 * and customize as needed
 */

// Add to your page's main script section

/**
 * Initialize cached data on page load
 * Place this in a DOMContentLoaded event listener
 */
async function initPageWithCache() {
    console.log('[Page] Initializing with cached data...');
    const pageLoadStart = performance.now();

    try {
        // Get cached property data
        const propertyId = localStorage.getItem('currentPropertyId');
        if (!propertyId) {
            console.warn('[Page] No property ID found, redirecting to dashboard');
            window.location.href = 'dashboard.html';
            return;
        }

        // Load property data from cache immediately
        const cached = await CacheManager.getProperty(propertyId);
        
        if (cached && CacheManager.isCacheFresh(cached.timestamp)) {
            console.log('[Cache] Using fresh cached property data');
            updatePageUI(cached.data);
            
            // Refresh in background
            refreshPropertyDataBackground(propertyId);
        } else if (cached) {
            console.log('[Cache] Using stale cache, will refresh');
            updatePageUI(cached.data);
            
            // Get fresh data in background
            refreshPropertyDataBackground(propertyId);
        } else {
            console.log('[Cache] No cached data, loading from Firestore');
            // Load from localStorage (fallback)
            const localData = localStorage.getItem('currentPropertyData');
            if (localData) {
                updatePageUI(JSON.parse(localData));
            }
            
            // Fetch fresh data
            refreshPropertyDataBackground(propertyId);
        }

        // Show page content (already loaded from cache)
        document.body.style.display = 'block';

        const pageLoadEnd = performance.now();
        console.log(`[Perf] Page loaded in ${(pageLoadEnd - pageLoadStart).toFixed(0)}ms`);

    } catch (error) {
        console.error('[Page] Error initializing page:', error);
        window.location.href = 'dashboard.html';
    }
}

/**
 * Refresh property data in background without blocking UI
 */
async function refreshPropertyDataBackground(propertyId) {
    if (!('db' in window)) {
        console.warn('[Page] Firebase not available');
        return;
    }

    try {
        const propertyDoc = await db.collection('properties').doc(propertyId).get();
        
        if (propertyDoc.exists) {
            const propertyData = propertyDoc.data();
            
            // Cache the fresh data
            await CacheManager.saveProperty(propertyId, propertyData);
            console.log('[Perf] Property data refreshed');
            
            // Update UI if needed
            updatePageUI(propertyData);
            localStorage.setItem('currentPropertyData', JSON.stringify(propertyData));
        }
    } catch (error) {
        console.warn('[Page] Error refreshing data:', error);
    }
}

/**
 * Update page UI with property data
 * Customize this function for your specific page
 */
function updatePageUI(propertyData) {
    if (!propertyData) return;

    // Example: Update page title
    if (propertyData.propertyName) {
        document.title = `${propertyData.propertyName} - Dashboard`;
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = propertyData.propertyName;
        }
    }

    // Add your custom UI updates here
    // Example:
    // - Update room counts
    // - Display facility info
    // - Load user preferences
    // - Update navigation breadcrumbs
}

/**
 * Check if user session is still valid
 * This should run periodically to ensure access isn't expired
 */
async function checkSessionValidity() {
    try {
        const propertyId = localStorage.getItem('currentPropertyId');
        const propertyData = localStorage.getItem('currentPropertyData');

        if (!propertyId || !propertyData) {
            window.location.href = 'dashboard.html';
            return;
        }

        const data = JSON.parse(propertyData);
        const expiryDateTime = new Date(data.expiryDate + ' ' + data.expiryTime);

        if (expiryDateTime <= new Date()) {
            alert('Your session has expired. Please log in again.');
            localStorage.clear();
            await CacheManager.clearCache();
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('[Page] Session check error:', error);
    }
}

/**
 * Optimize images on this page
 */
async function optimizePageImages() {
    const images = document.querySelectorAll('img');
    let optimizedCount = 0;

    for (const img of images) {
        try {
            // Skip external images
            if (!img.src.startsWith('./assets/')) continue;

            // Try to load from cache
            const cachedSrc = await CacheManager.getImage(img.src);
            if (cachedSrc !== img.src) {
                img.src = cachedSrc;
                optimizedCount++;
            }
        } catch (error) {
            console.warn('[Page] Error optimizing image:', error);
        }
    }

    console.log(`[Perf] Optimized ${optimizedCount} images`);
}

/**
 * Setup page-level performance monitoring
 */
function setupPerformanceMonitoring() {
    if (typeof PerfUtils !== 'undefined') {
        // Mark page-specific events
        PerfUtils.mark('page-interactive');

        // Report metrics when idle
        PerfUtils.scheduleIdleTask(() => {
            const report = PerfUtils.getPerformanceReport();
            console.log('[Perf] Page Performance:', report);
        });

        // Setup lazy loading for non-critical images
        PerfUtils.lazyLoadImages('img[data-src]');
    }
}

// ============================================================
// USAGE IN YOUR HTML FILE:
// ============================================================

/*
Add this to your HTML file (e.g., control.html):

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Control Page</title>
    <style>
        body { display: none; } {* Hide until loaded *}
    </style>
</head>
<body>
    {* Your page content *}

    {* Add these scripts at the end before closing body *}
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="firebase-config.js"></script>
    <script src="cache-manager.js"></script>
    <script src="perf-utils.js"></script>
    <script src="page-cache-template.js"></script> {* This file *}

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            // Initialize with cached data (shows instantly)
            await initPageWithCache();

            // Optimize images on this page
            await optimizePageImages();

            // Setup performance monitoring
            setupPerformanceMonitoring();

            // Check session validity periodically
            setInterval(checkSessionValidity, 5 * 60 * 1000); {* Every 5 minutes *}

            // Your page-specific code here...
        });

        // Check on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[Page] Page visible, checking session');
                checkSessionValidity();
            }
        });
    </script>
</body>
</html>
*/

// ============================================================
// MINIMAL IMPLEMENTATION (Copy-paste into any page):
// ============================================================

/*
// Just add these 3 lines to your existing page:

<script src="cache-manager.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
    const propertyData = JSON.parse(
        localStorage.getItem('currentPropertyData') || '{}'
    );
    
    // Update your UI with propertyData
    console.log('Using cached property:', propertyData.propertyName);
});
</script>
*/
