# 🚀 Avatar Quick Reference Card

## ✅ The One Rule

**ALWAYS use `UserAvatar` - NEVER use `Avatar` directly**

---

## 📝 Copy-Paste Templates

### Basic Usage
```typescript
import { UserAvatar } from "@/components/ui/user-avatar"

<UserAvatar user={user} className="w-10 h-10" />
```

### Common Sizes
```typescript
// Small (notifications, lists)
<UserAvatar user={user} className="w-6 h-6" />

// Medium (comments, cards)
<UserAvatar user={user} className="w-10 h-10" />

// Large (profiles, headers)
<UserAvatar user={user} className="w-20 h-20" />
```

### With Level Frame
```typescript
<UserAvatar user={user} showLevelFrame={true} />
```

### With Click Handler
```typescript
<div onClick={() => router.push(`/profile/${user.username}`)}>
  <UserAvatar user={user} className="w-10 h-10" />
</div>
```

---

## 🎯 User Object Structure

```typescript
user={{
  username: string,      // Required - used as seed
  avatar?: string,       // Optional - user's photo
  displayName?: string,  // Optional - fallback text
  gender?: string,       // Optional - for style selection
  level?: number         // Optional - for level frame
}}
```

---

## ❌ What NOT to Do

```typescript
// ❌ DON'T DO THIS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
<Avatar>
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.username[0]}</AvatarFallback>
</Avatar>

// ❌ DON'T DO THIS
import { getAvatarUrl } from "@/lib/avatar-utils"
<img src={getAvatarUrl(user.avatar)} />

// ✅ DO THIS INSTEAD
import { UserAvatar } from "@/components/ui/user-avatar"
<UserAvatar user={user} />
```

---

## 🔧 Troubleshooting

### Avatar not showing?
```typescript
// Check user object has username
console.log(user.username) // Must exist!

// Verify import
import { UserAvatar } from "@/components/ui/user-avatar" // ✅
import { Avatar } from "@/components/ui/avatar" // ❌
```

### Wrong size?
```typescript
// Use Tailwind classes
className="w-10 h-10" // ✅
className="w-[40px] h-[40px]" // ✅
style={{ width: 40, height: 40 }} // ❌ (use className)
```

### Need custom styling?
```typescript
// Wrap in div
<div className="ring-2 ring-blue-500 rounded-full">
  <UserAvatar user={user} />
</div>
```

---

## 📊 Size Guide

| Use Case | Size | Class |
|----------|------|-------|
| Tiny (badges) | 16px | `w-4 h-4` |
| Small (lists) | 24px | `w-6 h-6` |
| Medium (cards) | 40px | `w-10 h-10` |
| Large (profiles) | 80px | `w-20 h-20` |
| XL (headers) | 128px | `w-32 h-32` |

---

## 🎨 Style Variations

### With Ring
```typescript
<UserAvatar user={user} className="w-10 h-10 ring-2 ring-emerald-500" />
```

### With Shadow
```typescript
<UserAvatar user={user} className="w-10 h-10 shadow-lg" />
```

### With Border
```typescript
<UserAvatar user={user} className="w-10 h-10 border-2 border-white" />
```

---

## 🚨 ESLint Will Catch

```typescript
// ESLint Error: Don't use Avatar directly!
import { Avatar } from "@/components/ui/avatar" // ❌

// ESLint Warning: Use UserAvatar instead
import { getAvatarUrl } from "@/lib/avatar-utils" // ⚠️
```

---

## 💡 Pro Tips

1. **Always pass username** - It's required for DiceBear generation
2. **Use className for sizing** - More consistent than inline styles
3. **Wrap for click handlers** - Don't add onClick to UserAvatar directly
4. **Check user object** - Ensure it's not null/undefined
5. **Use showLevelFrame** - When you want to display user level

---

## 📚 More Info

- **Full Guide**: `AVATAR_DRY_PRINCIPLE.md`
- **Technical Details**: `AVATAR_FIX_COMPLETE.md`
- **Summary**: `FINAL_AVATAR_SUMMARY.md`

---

**Remember**: One component, used everywhere! 🎯
