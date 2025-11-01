// lib/cache-buster.ts
"use client";

/**
 * Cache Buster Utility
 * Forces browser to clear old caches and refresh content
 */

const CACHE_VERSION = 'v3'; // Increment this to force cache clear
const CACHE_VERSION_KEY = 'devsocial_cache_version';

export function checkAndClearCache() {
  if (typeof window === 'undefined') return;
  
  const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
  
  if (currentVersion !== CACHE_VERSION) {
    console.log('[Cache Buster] Clearing old cache...');
    
    // Clear localStorage cache markers
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('cache') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name !== `devsocial-${CACHE_VERSION}`) {
            caches.delete(name);
          }
        });
      });
    }
    
    // Update version
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    
    console.log('[Cache Buster] Cache cleared successfully');
  }
}

// Auto-run on import
if (typeof window !== 'undefined') {
  checkAndClearCache();
}
