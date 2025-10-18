# 🔧 Update All Avatars to SmartAvatar

## Problem
Avatars are blank because components are using the old `Avatar` component instead of `SmartAvatar`.

## Quick Fix

Replace all instances of Avatar with SmartAvatar. Here's the pattern:

### Before (Old)
```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.username[0]}</AvatarFallback>
</Avatar>
```

### After (New)
```tsx
import { SmartAvatar } from "@/components/ui/smart-avatar"

<SmartAvatar
  src={user.avatar}
  username={user.username}
  level={user.level}
  alt={user.displayName || user.username}
  className="w-10 h-10"
  showLevelFrame={true}
/>
```

## Files That Need Updating

Run this command to see all files:
```bash
findstr /S /I /C:"from \"@/components/ui/avatar\"" *.tsx *.ts 2>nul | findstr /V "node_modules" | findstr /V ".next"
```

### Priority Files (Most Visible)
1. ✅ `components/leaderboard/enhanced-leaderboard.tsx` - FIXED
2. `components/feed/FeedItem.tsx` - Feed posts
3. `components/feed/comment-item.tsx` - Comments
4. `components/layout/side-nav.tsx` - Sidebar
5. `app/(authenticated)/home/page.tsx` - Home page
6. `app/(authenticated)/search/page.tsx` - Search results

## Automated Fix Script

I'll create a helper component that makes this easier:

