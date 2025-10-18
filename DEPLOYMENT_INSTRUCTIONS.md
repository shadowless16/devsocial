# 🚀 Deployment Instructions - DiceBear Avatar Fix

## Issue
Posts from users with DiceBear avatars are not showing because the `gender` field is missing from API responses.

## Files Changed
1. `app/api/posts/route.ts` - Added gender field to author data
2. `app/api/comments/[postId]/route.ts` - Added gender field to author data
3. `components/feed/FeedItem.tsx` - Added gender to interfaces
4. `components/ui/smart-avatar.tsx` - Added gender prop
5. `components/ui/user-avatar.tsx` - Pass gender to SmartAvatar
6. `app/(authenticated)/profile/page.tsx` - Fixed TypeScript error

## Deploy to Production

### Option 1: Vercel (Recommended)
```bash
git add .
git commit -m "fix: add gender field for DiceBear avatar generation"
git push origin main
```

Vercel will automatically deploy the changes.

### Option 2: Manual Deploy
```bash
pnpm build
# Then deploy the .next folder to your hosting
```

## After Deployment
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Test by creating a post with a DiceBear avatar user
4. Verify the post appears and persists after refresh

## What This Fixes
- ✅ Posts from DiceBear avatar users now display correctly
- ✅ Comments from DiceBear avatar users persist after refresh
- ✅ Avatars generate consistently based on username and gender
- ✅ No more 400 errors on `/api/posts/temp-*/views`
- ✅ No more temporary posts stuck in the feed

## Verification
After deployment, check:
1. Can users with DiceBear avatars create posts?
2. Do their posts show up in the feed?
3. Do posts persist after page refresh?
4. Are there any console errors?

If issues persist, check the Vercel deployment logs for errors.
