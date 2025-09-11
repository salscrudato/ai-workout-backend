/**
 * Utility for managing cache-related headers and meta tags
 * Helps ensure immediate updates on mobile devices
 */

export interface CacheConfig {
  disableCache?: boolean;
  shortTTL?: boolean;
  forceRevalidate?: boolean;
}

/**
 * Inject cache control meta tags into document head
 */
export const injectCacheControlMeta = (config: CacheConfig = {}) => {
  const { disableCache = false, shortTTL = false, forceRevalidate = false } = config;
  
  // Remove existing cache control meta tags
  const existingMetas = document.querySelectorAll('meta[http-equiv*="Cache"], meta[name*="cache"]');
  existingMetas.forEach(meta => meta.remove());
  
  const metaTags = [];
  
  if (disableCache) {
    metaTags.push(
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' },
      { name: 'cache-control', content: 'no-cache' }
    );
  } else if (shortTTL) {
    metaTags.push(
      { httpEquiv: 'Cache-Control', content: 'public, max-age=300, must-revalidate' },
      { name: 'cache-control', content: 'short-ttl' }
    );
  }
  
  if (forceRevalidate) {
    metaTags.push(
      { httpEquiv: 'Cache-Control', content: 'must-revalidate' }
    );
  }
  
  // Add timestamp for cache busting
  metaTags.push(
    { name: 'cache-timestamp', content: Date.now().toString() },
    { name: 'app-version', content: `${import.meta.env.VITE_APP_VERSION || 'dev'}-${Date.now()}` }
  );
  
  // Inject meta tags
  metaTags.forEach(({ httpEquiv, name, content }) => {
    const meta = document.createElement('meta');
    if (httpEquiv) meta.setAttribute('http-equiv', httpEquiv);
    if (name) meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  });
  
  console.log('📝 Injected cache control meta tags:', metaTags);
};

/**
 * Add cache-busting query parameters to URLs
 */
export const addCacheBuster = (url: string, timestamp?: number): string => {
  const cacheBuster = timestamp || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${cacheBuster}`;
};

/**
 * Configure fetch requests with cache-busting headers
 */
export const getCacheBustingHeaders = (config: CacheConfig = {}): HeadersInit => {
  const { disableCache = false, forceRevalidate = false } = config;
  
  const headers: HeadersInit = {};
  
  if (disableCache) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  } else if (forceRevalidate) {
    headers['Cache-Control'] = 'must-revalidate';
  }
  
  // Add timestamp header for server-side cache busting
  headers['X-Cache-Timestamp'] = Date.now().toString();
  
  return headers;
};

/**
 * Initialize cache control based on environment and URL parameters
 */
export const initializeCacheControl = () => {
  const isDev = import.meta.env.DEV;
  const isMobileDev = window.location.hostname.includes('192.168') || 
                     window.location.hostname.includes('10.0') ||
                     window.location.hostname.includes('localhost');
  const urlParams = new URLSearchParams(window.location.search);
  const forceNoCache = urlParams.has('no-cache') || urlParams.has('dev');
  
  const shouldMinimizeCache = isDev || isMobileDev || forceNoCache;
  
  if (shouldMinimizeCache) {
    console.log('🚫 Cache minimization enabled');
    injectCacheControlMeta({ 
      disableCache: forceNoCache,
      shortTTL: !forceNoCache,
      forceRevalidate: true 
    });
    
    // Add visual indicator for development
    if (isDev || forceNoCache) {
      const indicator = document.createElement('div');
      indicator.innerHTML = '🚫 CACHE DISABLED';
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        border-radius: 0 0 8px 8px;
        font-family: monospace;
      `;
      document.body.appendChild(indicator);
      
      // Remove after 3 seconds
      setTimeout(() => indicator.remove(), 3000);
    }
  }
  
  return shouldMinimizeCache;
};

/**
 * Force reload with cache bypass
 */
export const hardReload = () => {
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Unregister service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Force reload with cache bypass
  window.location.reload();
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeCacheControl();
}
