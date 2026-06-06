/**
 * Performance Utilities for RentDomotics Dashboard
 * Provides helpers for image loading, cache management, and analytics
 */

const PerfUtils = (() => {
    // Performance metrics
    const metrics = {
        pageLoadStart: performance.now(),
        markings: {}
    };

    /**
     * Mark a performance milestone
     */
    function mark(name) {
        if (window.performance && window.performance.mark) {
            performance.mark(name);
            metrics.markings[name] = performance.now();
            console.log(`[Perf] Mark: ${name}`);
        }
    }

    /**
     * Measure time between two marks
     */
    function measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                console.log(`[Perf] Measure: ${name} = ${measure.duration.toFixed(2)}ms`);
                return measure.duration;
            } catch (error) {
                console.warn(`[Perf] Measure failed: ${name}`, error);
            }
        }
    }

    /**
     * Get Core Web Vitals metrics
     */
    function getCoreWebVitals() {
        const vitals = {
            lcp: null,
            fid: null,
            cls: null
        };

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('[Perf] LCP observer failed:', e);
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        vitals.fid = entry.processingDuration;
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('[Perf] FID observer failed:', e);
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            vitals.cls = (vitals.cls || 0) + entry.value;
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('[Perf] CLS observer failed:', e);
            }
        }

        return vitals;
    }

    /**
     * Get comprehensive performance report
     */
    function getPerformanceReport() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        
        if (!navTiming) {
            return { error: 'Navigation timing not available' };
        }

        return {
            dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
            tcp: navTiming.connectEnd - navTiming.connectStart,
            ttfb: navTiming.responseStart - navTiming.requestStart,
            download: navTiming.responseEnd - navTiming.responseStart,
            domInteractive: navTiming.domInteractive - navTiming.fetchStart,
            domComplete: navTiming.domComplete - navTiming.fetchStart,
            pageLoad: navTiming.loadEventEnd - navTiming.fetchStart,
            paintTiming: performance.getEntriesByType('paint').map(p => ({
                name: p.name,
                time: p.startTime
            }))
        };
    }

    /**
     * Report performance metrics to console and optionally to server
     */
    async function reportMetrics(endpoint = null) {
        const timing = getPerformanceReport();
        const vitals = getCoreWebVitals();

        const report = {
            timing,
            vitals,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        console.log('[Perf] Performance Report:', report);

        if (endpoint) {
            try {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });
                console.log('[Perf] Metrics sent to server');
            } catch (error) {
                console.warn('[Perf] Failed to send metrics:', error);
            }
        }

        return report;
    }

    /**
     * Lazy load images with Intersection Observer
     */
    function lazyLoadImages(selector = 'img[data-src]') {
        if (!('IntersectionObserver' in window)) {
            // Fallback: load all images immediately
            document.querySelectorAll(selector).forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll(selector).forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Enable request idle callback polyfill
     */
    function scheduleIdleTask(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    /**
     * Get cache statistics from Service Worker
     */
    async function getCacheStats() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_CACHE_STATS' },
                    [channel.port2]
                );
                channel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
            });
        }
        return null;
    }

    /**
     * Clear all Service Worker caches
     */
    async function clearAllCaches() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CLEAR_CACHE'
            });
        }
        await CacheManager.clearCache();
    }

    return {
        mark,
        measure,
        getCoreWebVitals,
        getPerformanceReport,
        reportMetrics,
        lazyLoadImages,
        scheduleIdleTask,
        getCacheStats,
        clearAllCaches
    };
})();

// Report metrics when page becomes idle
if (document.readyState === 'complete') {
    PerfUtils.reportMetrics();
} else {
    window.addEventListener('load', () => {
        PerfUtils.scheduleIdleTask(() => {
            PerfUtils.reportMetrics();
        });
    });
}
