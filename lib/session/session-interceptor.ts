// lib/session-interceptor.ts
"use client";

// Intercept and cache NextAuth session calls
let sessionCache: unknown = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds only

// Override fetch for session endpoints
const originalFetch = globalThis.fetch;

if (typeof window !== 'undefined') {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Intercept session API calls
    if (url.includes('/api/auth/session')) {
      const now = Date.now();
      
      // Return cached session if still valid
      if (sessionCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return new Response(JSON.stringify(sessionCache), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Make actual request and cache result
      const response = await originalFetch(input, init);
      if (response.ok) {
        const data = await response.clone().json();
        sessionCache = data;
        cacheTimestamp = now;
      }
      return response;
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
}

export const clearSessionCache = () => {
  sessionCache = null;
  cacheTimestamp = 0;
};