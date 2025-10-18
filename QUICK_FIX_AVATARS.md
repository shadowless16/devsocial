# 🚨 Quick Fix: Blank Avatars

## Problem
Avatars are blank because components need the `username` prop to generate DiceBear avatars.

## Immediate Solution

Use the new `UserAvatar` component - it's a drop-in replacement!

### Before (Blank Avatars)
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.username[0]}</AvatarFallback>
</Avatar>
```

### After (Working Avatars)
```tsx
import { UserAvatar } from "@/components/ui/user-avatar"

<UserAvatar user={user} className="w-10 h-10" />
```

## That's It!

The `UserAvatar` component automatically:
- ✅ Generates DiceBear avatar if no photo
- ✅ Uses username as seed (consistent)
- ✅ Respects gender for style selection
- ✅ Shows level frames (optional)
- ✅ Handles all edge cases

## Example Usage

```tsx
// Simple
<UserAvatar user={post.author} />

// With level frame
<UserAvatar user={post.author} showLevelFrame={true} />

// Custom size
<UserAvatar user={post.author} className="w-12 h-12" />

// In leaderboard (no frame)
<UserAvatar user={entry.user} className="w-8 h-8" showLevelFrame={false} />
```

## Files Already Fixed
- ✅ `components/leaderboard/enhanced-leaderboard.tsx`

## Files That Need Fixing
Just replace `<Avatar>` with `<UserAvatar user={user} />` in:
- `components/feed/FeedItem.tsx`
- `components/feed/comment-item.tsx`
- `components/layout/side-nav.tsx`
- All other files using Avatar

## Test It
1. Import `UserAvatar`
2. Replace `<Avatar>` with `<UserAvatar user={user} />`
3. Refresh page
4. See colorful avatars! 🎨

---

**This is the easiest way to fix all blank avatars!**

<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.username[0]}</AvatarFallback>
</Avatar>
