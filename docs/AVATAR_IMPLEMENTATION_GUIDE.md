# Avatar System Implementation Guide

## Quick Start

### Step 1: Update Existing Avatar Components

Find all places where you're currently using avatars and replace with `SmartAvatar`:

**Before:**
```tsx
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.username[0]}</AvatarFallback>
</Avatar>
```

**After:**
```tsx
<SmartAvatar
  src={user.avatar}
  username={user.username}
  level={user.level}
  alt={user.displayName}
  showLevelFrame={true}
/>
```

### Step 2: Common Locations to Update

1. **Feed Items** - User posts in feed
2. **Profile Pages** - User profile header
3. **Comments** - Comment author avatars
4. **Leaderboard** - User rankings
5. **Search Results** - User search results
6. **Notifications** - Notification avatars
7. **Messages** - Chat/message avatars
8. **Sidebar** - Current user avatar

### Step 3: Add Reward Toast to Profile Upload

In your profile upload component:

```tsx
import { RewardToast } from "@/components/ui/reward-toast"
import { useState } from "react"

export function ProfileUpload() {
  const [reward, setReward] = useState(null)

  const handleUpload = async (avatarUrl: string) => {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarUrl })
    })
    
    const data = await response.json()
    
    if (data.data.reward) {
      setReward(data.data.reward)
    }
  }

  return (
    <>
      {/* Your upload UI */}
      
      {reward && (
        <RewardToast
          xp={reward.xp}
          badge={reward.badge}
          message={reward.message}
          onClose={() => setReward(null)}
        />
      )}
    </>
  )
}
```

## Component Props Reference

### SmartAvatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Avatar image URL |
| `username` | `string` | - | Username for DiceBear generation |
| `level` | `number` | `1` | User level for frame |
| `alt` | `string` | `"Avatar"` | Alt text for image |
| `className` | `string` | `""` | Additional CSS classes |
| `showLevelFrame` | `boolean` | `true` | Show level-based frame |
| `size` | `number` | - | Avatar size (optional) |

### RewardToast Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `xp` | `number` | Yes | XP amount earned |
| `badge` | `string` | No | Badge ID earned |
| `message` | `string` | Yes | Reward message |
| `onClose` | `() => void` | No | Close callback |

## Migration Checklist

- [ ] Install DiceBear packages (`pnpm add @dicebear/collection @dicebear/core`)
- [ ] Update all avatar components to use `SmartAvatar`
- [ ] Add reward toast to profile upload flow
- [ ] Test default avatar generation for new users
- [ ] Test XP reward on first upload
- [ ] Test level frame rendering at different levels
- [ ] Update any avatar-related tests
- [ ] Deploy and monitor

## Common Patterns

### Pattern 1: Feed Item Avatar
```tsx
<SmartAvatar
  src={post.author.avatar}
  username={post.author.username}
  level={post.author.level}
  alt={post.author.displayName}
  className="w-10 h-10"
/>
```

### Pattern 2: Profile Header Avatar
```tsx
<SmartAvatar
  src={user.avatar}
  username={user.username}
  level={user.level}
  alt={user.displayName}
  className="w-24 h-24"
  showLevelFrame={true}
/>
```

### Pattern 3: Small Avatar (No Frame)
```tsx
<SmartAvatar
  src={user.avatar}
  username={user.username}
  level={user.level}
  alt={user.displayName}
  className="w-6 h-6"
  showLevelFrame={false}
/>
```

### Pattern 4: Anonymous Avatar
```tsx
<SmartAvatar
  src="/anonymous-avatar.png"
  username="anonymous"
  level={1}
  alt="Anonymous"
  showLevelFrame={false}
/>
```

## Testing Scenarios

### Test 1: New User Registration
1. Create new account
2. Check avatar is unique DiceBear illustration
3. Verify `isGenerated: true` in database
4. Confirm level 1 frame appears

### Test 2: First Upload Reward
1. Login as new user with generated avatar
2. Upload custom profile picture
3. Verify reward toast appears
4. Check 50 XP added to account
5. Confirm "First Impression" badge in profile
6. Verify `isGenerated: false` in database

### Test 3: Level Frame Progression
1. Create test users at different levels (1, 5, 15, 30, 50)
2. Verify correct frame colors
3. Check animations at level 30+
4. Confirm star badge at level 50+

### Test 4: Avatar Fallback
1. Set invalid avatar URL
2. Verify DiceBear fallback loads
3. Check no console errors
4. Confirm graceful degradation

## Performance Considerations

### DiceBear Generation
- Avatars are generated as data URIs (base64)
- No external API calls required
- Instant generation, no loading time
- Cached by browser automatically

### Optimization Tips
1. Use `useMemo` for avatar generation (already implemented)
2. Lazy load avatars in long lists
3. Consider image optimization for uploaded avatars
4. Use appropriate sizes for different contexts

## Troubleshooting

### Issue: Avatars showing as letters
**Solution:** Ensure `username` prop is passed to `SmartAvatar`

### Issue: Level frames not visible
**Solution:** Check `showLevelFrame={true}` and `level` prop is provided

### Issue: XP not awarded on upload
**Solution:** Verify user has `isGenerated: true` before upload

### Issue: DiceBear avatars look the same
**Solution:** Ensure unique `username` is used as seed

## Next Steps

After implementation:
1. Monitor user engagement metrics
2. Track profile picture upload rates
3. Analyze level distribution
4. Gather user feedback
5. Consider additional gamification features

## Support

Need help? Check:
- Main documentation: `docs/AVATAR_SYSTEM.md`
- Component source: `components/ui/smart-avatar.tsx`
- API endpoint: `app/api/users/profile/route.ts`
- Badge system: `utils/badge-system.ts`
