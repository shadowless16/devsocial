# API Migration Plan: Next.js → Backend

## Current Status

**Next.js has 100+ API routes** that need to be migrated to the backend.

## What's Already Done ✅

Backend has these routes:
- ✅ Auth (signup, login)
- ✅ Users (profile, get user)
- ✅ Posts (CRUD)
- ✅ Gamification (XP, leaderboard)
- ✅ Notifications (get, mark read)
- ✅ Analytics (overview, growth)

## What Still Needs Migration

### High Priority (Core Features)
1. **Comments** - `/api/comments/*`
2. **Likes** - `/api/likes/*`
3. **Follow System** - `/api/users/follow/*`
4. **Feed Algorithm** - `/api/feed`
5. **Search** - `/api/search/*`
6. **Upload** - `/api/upload/*`

### Medium Priority
7. **Challenges** - `/api/challenges/*`
8. **Communities** - `/api/communities/*`
9. **Messages** - `/api/messages/*`
10. **Projects** - `/api/projects/*`
11. **Referrals** - `/api/referrals/*`
12. **Tags** - `/api/tags/*`

### Low Priority
13. **Admin** - `/api/admin/*`
14. **Moderator** - `/api/mod/*`
15. **AI Features** - `/api/ai/*`
16. **Career Paths** - `/api/career-paths/*`
17. **Knowledge Bank** - `/api/knowledge-bank/*`
18. **Polls** - `/api/polls/*`
19. **Feedback** - `/api/feedback/*`

### Can Delete
- `/api/test-*` - Test routes
- `/api/debug/*` - Debug routes
- `/api/proxy-*` - Proxy routes (for microservices)

## Two Options

### Option A: Gradual Migration (Recommended)
**Keep both running during transition**

```
Frontend → Backend API (new routes)
        ↘ Next.js API (old routes)
```

**Steps:**
1. Keep Next.js API routes as-is
2. Migrate routes one by one to backend
3. Update frontend to call backend for migrated routes
4. Delete Next.js routes after migration

**Pros:** Zero downtime, test as you go
**Cons:** Temporary complexity

### Option B: Big Bang Migration
**Move everything at once**

```
Frontend → Backend API (all routes)
```

**Steps:**
1. Copy all 100+ routes to backend
2. Update all frontend calls
3. Delete all Next.js API routes
4. Deploy

**Pros:** Clean cut
**Cons:** Risky, lots of testing needed

## Recommended Approach

**Hybrid Strategy:**

### Phase 1: Keep Next.js API (Current)
- Backend exists but isn't used yet
- Frontend still calls Next.js API routes
- **No changes needed**

### Phase 2: When Building Mobile App
- Mobile app calls backend API
- Web app still uses Next.js API
- Gradually migrate routes as needed

### Phase 3: Full Migration (Future)
- Both web and mobile use backend
- Delete Next.js API routes

## Quick Win: Dual Mode

Add an environment variable to toggle:

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_USE_BACKEND 
  ? 'http://localhost:4000/api'  // Backend
  : '/api'                         // Next.js

export const api = {
  get: (path) => fetch(`${API_BASE}${path}`)
}
```

**Benefits:**
- Switch between backends instantly
- Test backend without breaking frontend
- Gradual migration

## My Recommendation

**Don't migrate yet!** Here's why:

1. **Next.js API works** - It's deployed, tested, and stable
2. **No mobile app yet** - Main reason for backend doesn't exist
3. **100+ routes** - Massive effort to migrate and test
4. **Risk** - Could break production

**Instead:**
- Keep backend code as reference
- Use it when you start mobile app
- Migrate routes only as needed

## If You Insist on Migrating

I can create a script to:
1. Scan all Next.js API routes
2. Generate equivalent Express routes
3. Create migration checklist

But honestly, **it's premature**. Focus on features users want, not architecture.

---

**Bottom Line:** Backend is ready when you need it. Don't migrate until you have a reason (mobile app, scaling issues, etc.)
