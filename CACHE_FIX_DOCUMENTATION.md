# Aggressive Caching Fix - Stale Posts Issue

## Problem
Users were seeing posts from 3 days ago instead of recent posts. New devices showed fresh content, but existing users had stale cached data. Clearing browser cache fixed it temporarily, but this isn't a viable solution for all users.

## Root Causes Identified

### 1. Service Worker Aggressive Caching
- **Issue**: Service worker was caching ALL GET requests including API calls
- **Impact**: Posts API responses were cached indefinitely
- **Location**: `public/sw.js`

### 2. API Client Cache Layer
- **Issue**: Posts were being cached for extended periods
- **Impact**: Feed showed old posts even when new ones existed
- **Location**: `lib/api-client.ts`

### 3. Session Interceptor Over-Caching
- **Issue**: 2-minute cache on session calls was too aggressive
- **Impact**: User data updates were delayed
- **Location**: `lib/session-interceptor.ts`

### 4. No Cache Versioning
- **Issue**: No mechanism to force cache refresh on updates
- **Impact**: Users stuck with old cache until manual clear

## Solutions Implemented

### 1. Service Worker Fix (`public/sw.js`)

**Changes:**
- Bumped cache version from `v2` to `v3` to invalidate old caches
- Added explicit API request bypass - NEVER cache `/api/*` endpoints
- Implemented network-first strategy for dynamic pages (`/home`, `/dashboard`, `/profile`, `/leaderboard`)
- Kept cache-first only for static assets

**Before:**
```javascript
// Cached everything including API calls
event.respondWith(
  caches.match(event.request).then((response) => {
    return response || fetch(event.request);
  })
);
```

**After:**
```javascript
// Never cache API requests
if (url.pathname.startsWith('/api/')) {
  event.respondWith(fetch(event.request));
  return;
}

// Network-first for dynamic pages
if (dynamicPages.includes(url.pathname)) {
  event.respondWith(
    fetch(event.request)
      .then(response => { /* cache then return */ })
      .catch(() => caches.match(event.request)) // Offline fallback
  );
}
```

### 2. API Client Cache Reduction (`lib/api-client.ts`)

**Changes:**
- Removed posts from cache configuration entirely
- Reduced profile cache from 5 minutes to 2 minutes
- Reduced trending cache from 2 minutes to 30 seconds
- Reduced leaderboard cache from 3 minutes to 1 minute
- Removed dashboard from cache configuration
- Force-delete cache before fetching posts
- Added explicit no-cache headers

**Cache Configuration:**
```typescript
private cacheConfigs: Record<string, CacheConfig> = {
  '/users/profile': { ttl: 2 * 60 * 1000 }, // 2 minutes (was 5)
  '/profile': { ttl: 2 * 60 * 1000 },
  '/trending': { ttl: 30 * 1000, staleWhileRevalidate: true }, // 30 seconds (was 2 min)
  '/leaderboard': { ttl: 1 * 60 * 1000, staleWhileRevalidate: true }, // 1 minute (was 3)
  // Posts and dashboard NOT cached at all
};
```

**Posts Fetch:**
```typescript
public async getPosts<T>(params?: Record<string, string>): Promise<ApiResponse<T>> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const cacheKey = this.getCacheKey(`/posts${query}`, { method: 'GET' });
  this.cache.delete(cacheKey); // Always clear before fetching
  
  return this.fetchRequest<T>(`/posts${query}`, { 
    method: "GET",
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}
```

### 3. Session Cache Reduction (`lib/session-interceptor.ts`)

**Changes:**
- Reduced session cache from 2 minutes to 30 seconds
- Allows faster user data updates

**Before:**
```typescript
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
```

**After:**
```typescript
const CACHE_DURATION = 30 * 1000; // 30 seconds only
```

### 4. Cache Buster Implementation (`lib/cache-buster.ts`)

**New Feature:**
- Automatic cache version checking on app load
- Clears old localStorage cache entries
- Removes outdated service worker caches
- Version-based cache invalidation

**How it works:**
```typescript
const CACHE_VERSION = 'v3'; // Increment to force cache clear

export function checkAndClearCache() {
  const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
  
  if (currentVersion !== CACHE_VERSION) {
    // Clear localStorage cache markers
    // Clear service worker caches
    // Update version
  }
}
```

**Integration:**
Added to `app/providers.tsx` to run automatically on every app load.

## Server-Side Cache Headers

The posts API already had proper cache control headers:
```typescript
return NextResponse.json(responseData, {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});
```

## Expected Results

✅ **Immediate Benefits:**
- Users see fresh posts immediately
- No more 3-day-old content in feed
- New posts appear in real-time
- Dashboard shows current data

✅ **Performance:**
- Reduced cache TTLs mean less stale data
- Network-first strategy ensures freshness
- Static assets still cached for speed
- Offline functionality preserved

✅ **User Experience:**
- No need to manually clear cache
- Automatic cache refresh on updates
- Consistent experience across devices
- Real-time content updates

## Cache Strategy Summary

| Endpoint | Strategy | TTL | Notes |
|----------|----------|-----|-------|
| `/api/posts` | No cache | 0 | Always fresh |
| `/api/dashboard` | No cache | 0 | Always fresh |
| `/api/users/profile` | Cache | 2 min | User data |
| `/api/trending` | SWR | 30 sec | Stale-while-revalidate |
| `/api/leaderboard` | SWR | 1 min | Stale-while-revalidate |
| `/api/auth/session` | Cache | 30 sec | Session data |
| Dynamic pages | Network-first | - | Offline fallback |
| Static assets | Cache-first | - | Performance |

## Testing Checklist

- [x] Posts API returns fresh data
- [x] Service worker doesn't cache API calls
- [x] Cache buster clears old caches
- [x] Network-first works for dynamic pages
- [x] Offline mode still functional
- [ ] Test on production with real users
- [ ] Monitor cache hit rates
- [ ] Verify no performance degradation

## Deployment Steps

1. **Deploy code changes**
   - Service worker will auto-update
   - Cache buster runs on first load
   - Old caches automatically cleared

2. **Monitor metrics**
   - Watch for cache-related errors
   - Check API response times
   - Monitor user complaints

3. **Rollback plan** (if needed)
   - Revert `public/sw.js` to v2
   - Restore old cache configs
   - Remove cache buster import

## Future Improvements

1. **Implement ETag support** for conditional requests
2. **Add cache warming** for frequently accessed data
3. **Implement background sync** for offline posts
4. **Add cache analytics** to monitor effectiveness
5. **Consider Redis** for server-side caching

## Version History

- **v3** (Current) - Fixed aggressive caching, network-first for dynamic content
- **v2** (Previous) - Aggressive caching causing stale data
- **v1** (Initial) - Basic service worker implementation

---

**Fixed by**: Amazon Q Developer  
**Date**: 2025  
**Issue**: Users seeing 3-day-old posts due to aggressive caching  
**Status**: ✅ RESOLVED

## Quick Reference Commands

```bash
# Clear all caches manually (if needed)
# In browser console:
localStorage.clear()
caches.keys().then(names => names.forEach(name => caches.delete(name)))
location.reload()

# Check cache version
localStorage.getItem('devsocial_cache_version')

# Force service worker update
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.update()))
```
