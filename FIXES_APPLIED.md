# Fixes Applied - Feed & Root Route Issues

## Issues Fixed

### 1. Root Route (/) ERR_FAILED Error
**Problem**: Accessing `https://techdevsocial.vercel.app/` resulted in ERR_FAILED error

**Root Cause**: Server-side `redirect()` from Next.js doesn't work properly in production builds, especially with Vercel deployments

**Solution**: Changed from server-side redirect to client-side redirect using `useRouter`

**Files Modified**:
- `app/page.tsx` - Changed from server component with `redirect()` to client component with `useRouter().replace()`
- `app/(authenticated)/layout.tsx` - Removed duplicate redirect logic

### 2. Posts Not Showing in Feed
**Problem**: New posts were saving to database and showing on profile pages but not appearing in the home feed

**Root Causes**:
1. API client cache TTL was too long (30 seconds) - preventing fresh data from loading
2. Potential filtering issues in posts API

**Solutions**:
1. Reduced posts cache TTL from 30 seconds to 5 seconds in `lib/api-client.ts`
2. Ensured posts API returns all posts without unnecessary filtering in `app/api/posts/route.ts`

**Files Modified**:
- `lib/api-client.ts` - Reduced cache TTL for `/posts` endpoint
- `app/api/posts/route.ts` - Simplified query to ensure all posts are returned

## Testing Checklist

- [ ] Visit `https://techdevsocial.vercel.app/` - should redirect to `/home` without errors
- [ ] Create a new post - should appear immediately in feed (within 5 seconds)
- [ ] Refresh the page - post should still be visible
- [ ] Check profile page - post should appear there too
- [ ] Test on mobile and desktop

## Deployment Notes

After deploying these changes:
1. Clear any CDN/edge caches in Vercel
2. Test the root route immediately
3. Create a test post to verify feed updates
4. Monitor for any console errors

## Technical Details

### Cache Strategy
- Posts cache: 5 seconds (real-time feel)
- Profile cache: 5 minutes (less frequent updates)
- Dashboard cache: 1 minute (balance between freshness and performance)
- Trending cache: 2 minutes with stale-while-revalidate

### Redirect Strategy
- Root `/` uses client-side redirect to `/home`
- Authenticated layout no longer handles root redirect (prevents conflicts)
- All redirects use `router.replace()` to avoid back button issues
