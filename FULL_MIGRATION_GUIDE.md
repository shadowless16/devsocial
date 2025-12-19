# Complete API Migration Guide

## 🎯 Goal
Migrate all 100+ Next.js API routes to the unified Express backend.

## 📊 Current Status

### ✅ Completed (8 routes)
- Auth (signup, login, logout, etc.)
- Users (profile, follow, etc.)
- Posts (CRUD)
- Comments (GET, POST, DELETE)
- Likes (posts, comments)
- Gamification (XP, leaderboard)
- Notifications (get, mark read)
- Analytics (overview, growth)

### ⏳ Remaining (~92 routes)
See detailed breakdown below.

## 🛠️ Migration Tools

### 1. Route Scanner
Scans all Next.js routes and generates a report:
```bash
cd backend
node migrate-routes.js
```

### 2. Route Generator
Auto-generates Express route boilerplate:
```bash
cd backend
node generate-routes.js <category>
# Example: node generate-routes.js feed
```

### 3. Manual Migration
For complex routes, manually copy logic from Next.js to Express.

## 📋 Migration Checklist (By Priority)

### Priority 1: Core Features (CRITICAL)
- [ ] **Feed** (2 routes)
  - GET /api/feed - Generate personalized feed
  - POST /api/feed - Track interactions
- [ ] **Search** (4 routes)
  - GET /api/search - Basic search
  - GET /api/search/advanced - Advanced search
  - GET /api/search/smart - AI-powered search
  - GET /api/search/trending - Trending searches
- [ ] **Tags** (3 routes)
  - GET /api/tags - Get all tags
  - GET /api/tags/search - Search tags
  - GET /api/tags/trending - Trending tags
- [ ] **Trending** (1 route)
  - GET /api/trending - Get trending content

### Priority 2: User Features
- [ ] **Profile** (3 routes)
  - GET /api/profile - Get current user profile
  - PUT /api/profile - Update profile
  - GET /api/profile/activity - Get user activity
  - GET /api/profile/stats - Get user stats
- [ ] **Referrals** (3 routes)
  - POST /api/referrals/create - Create referral
  - GET /api/referrals/stats - Get referral stats
  - POST /api/referrals/check-all - Check all referrals
- [ ] **Upload** (2 routes)
  - POST /api/upload - Upload file
  - POST /api/upload/avatar - Upload avatar
- [ ] **Affiliations** (1 route)
  - GET /api/affiliations - Get user affiliations

### Priority 3: Social Features
- [ ] **Messages** (3 routes)
  - GET /api/messages/conversations - Get conversations
  - GET /api/messages/:conversationId - Get messages
  - POST /api/messages/:conversationId - Send message
  - POST /api/messages/:conversationId/:messageId/reactions - React to message
- [ ] **Communities** (4 routes)
  - GET /api/communities - Get all communities
  - POST /api/communities - Create community
  - GET /api/communities/:id - Get community
  - POST /api/communities/:id/join - Join community
  - GET /api/communities/:id/posts - Get community posts
- [ ] **Projects** (5 routes)
  - GET /api/projects - Get all projects
  - POST /api/projects - Create project
  - GET /api/projects/:id - Get project
  - POST /api/projects/:id/join - Join project
  - POST /api/projects/:id/like - Like project
  - PUT /api/projects/:id/status - Update project status
- [ ] **Polls** (1 route)
  - POST /api/polls/vote - Vote on poll
- [ ] **Feedback** (3 routes)
  - GET /api/feedback - Get all feedback
  - POST /api/feedback - Submit feedback
  - GET /api/feedback/:id - Get feedback
  - POST /api/feedback/:id/comments - Comment on feedback

### Priority 4: Gamification
- [ ] **Challenges** (5 routes)
  - GET /api/challenges - Get all challenges
  - GET /api/challenges/:challengeId - Get challenge
  - POST /api/challenges/:challengeId/join - Join challenge
  - POST /api/challenges/:challengeId/submit - Submit solution
  - GET /api/challenges/leaderboard - Challenge leaderboard
  - GET /api/challenges/recommended - Recommended challenges
  - GET /api/challenges/user - User challenges
- [ ] **XP Overtakes** (1 route)
  - GET /api/xp-overtakes/check - Check XP overtakes

### Priority 5: Learning & Career
- [ ] **Career Paths** (3 routes)
  - GET /api/career-paths - Get all career paths
  - GET /api/career-paths/:pathId - Get career path
  - POST /api/career-paths/:pathId/:moduleId - Complete module
- [ ] **Knowledge Bank** (2 routes)
  - GET /api/knowledge-bank - Get all articles
  - POST /api/knowledge-bank/:id/like - Like article

### Priority 6: AI Features
- [ ] **AI** (5 routes)
  - POST /api/ai/analyze-image - Analyze image
  - GET /api/ai/analyze-image/usage - Get usage stats
  - POST /api/ai/enhance-text - Enhance text
  - POST /api/ai/transcribe - Transcribe audio
  - GET /api/ai/transcribe/usage - Get transcription usage

### Priority 7: Moderation & Admin
- [ ] **Mod** (2 routes)
  - GET /api/mod/reports - Get all reports
  - PUT /api/mod/reports/:id/status - Update report status
- [ ] **Reports** (2 routes)
  - GET /api/reports - Get reports
  - POST /api/reports - Create report
  - GET /api/reports/:id - Get report
- [ ] **Admin** (10 routes)
  - GET /api/admin/users - Get all users
  - GET /api/admin/users/search - Search users
  - PUT /api/admin/users/update-role - Update user role
  - GET /api/admin/users/:userId - Get user
  - POST /api/admin/users/:userId/block - Block user
  - DELETE /api/admin/users/:userId/delete - Delete user
  - POST /api/admin/users/:userId/reset-password - Reset password
  - PUT /api/admin/users/:userId/role - Update role
  - POST /api/admin/users/:userId/xp - Award XP
  - POST /api/admin/make-admin - Make admin
  - POST /api/admin/assign-role - Assign role
  - GET /api/admin/feedback - Get feedback
  - GET /api/admin/ai-logs - Get AI logs

### Priority 8: System & Utilities
- [ ] **Cron** (3 routes)
  - POST /api/cron/analytics - Run analytics cron
  - POST /api/cron/check-overtakes - Check XP overtakes
  - POST /api/cron/complete-referrals - Complete referrals
- [ ] **Link Preview** (1 route)
  - GET /api/link-preview - Get link preview
- [ ] **Save Avatar** (1 route)
  - POST /api/save-avatar - Save avatar

### ❌ Delete These (Not Needed)
- /api/test-* (5 routes) - Test routes
- /api/debug/* (3 routes) - Debug routes
- /api/proxy-* (2 routes) - Microservices artifacts

## 🚀 Step-by-Step Migration Process

### Step 1: Generate Route Boilerplate
```bash
cd backend
node generate-routes.js feed
```

### Step 2: Implement Route Logic
1. Open generated file: `backend/src/routes/feed.routes.ts`
2. Open Next.js file: `app/api/feed/route.ts`
3. Copy business logic from Next.js to Express
4. Update imports (models, utils)
5. Replace NextResponse with Express res.json()
6. Replace authMiddleware pattern

### Step 3: Add Route to Server
Edit `backend/src/server.ts`:
```typescript
import feedRoutes from './routes/feed.routes'
app.use('/api/feed', feedRoutes)
```

### Step 4: Test Route
```bash
# Start backend
cd backend
pnpm dev

# Test with curl or Postman
curl http://localhost:4000/api/feed
```

### Step 5: Update Frontend
Edit `lib/api-client.ts` to use backend URL:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_USE_BACKEND 
  ? 'http://localhost:4000/api'
  : '/api'
```

### Step 6: Delete Next.js Route
After testing, delete `app/api/feed/route.ts`

## 📝 Code Conversion Patterns

### Pattern 1: Auth Middleware
**Next.js:**
```typescript
const authResult = await authMiddleware(request)
if (!authResult.success) {
  return NextResponse.json(errorResponse(authResult.error), { status: 401 })
}
const userId = authResult.user.id
```

**Express:**
```typescript
// Add authMiddleware to route
router.get('/path', authMiddleware, async (req, res) => {
  const userId = req.user!.id
})
```

### Pattern 2: Response
**Next.js:**
```typescript
return NextResponse.json({ success: true, data: result })
```

**Express:**
```typescript
res.json({ success: true, data: result })
```

### Pattern 3: Route Params
**Next.js:**
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**Express:**
```typescript
router.get('/:id', async (req, res) => {
  const { id } = req.params
})
```

### Pattern 4: Query Params
**Next.js:**
```typescript
const { searchParams } = new URL(request.url)
const page = searchParams.get('page')
```

**Express:**
```typescript
const page = req.query.page
```

### Pattern 5: Request Body
**Next.js:**
```typescript
const body = await request.json()
```

**Express:**
```typescript
const body = req.body
```

## 🧪 Testing Strategy

### 1. Unit Tests
Create tests for each route in `backend/tests/routes/`

### 2. Integration Tests
Test full flow: Frontend → Backend → Database

### 3. Manual Testing
Use Postman collection (create one for all routes)

### 4. Load Testing
Use k6 or Artillery to test performance

## 📦 Deployment Strategy

### Option A: Gradual Migration (Recommended)
1. Deploy backend to separate server
2. Use environment variable to toggle routes
3. Migrate routes one category at a time
4. Monitor for issues
5. Rollback if needed

### Option B: Big Bang
1. Migrate all routes
2. Test thoroughly in staging
3. Deploy everything at once
4. High risk, but clean cut

## 🎯 Timeline Estimate

- **Week 1**: Priority 1 (Feed, Search, Tags, Trending) - 10 routes
- **Week 2**: Priority 2-3 (User features, Social) - 20 routes
- **Week 3**: Priority 4-5 (Gamification, Learning) - 15 routes
- **Week 4**: Priority 6-7 (AI, Admin, Mod) - 20 routes
- **Week 5**: Priority 8 + Testing + Cleanup - 10 routes + testing

**Total: ~5 weeks for complete migration**

## 🚨 Important Notes

1. **Don't break production** - Test everything thoroughly
2. **Keep Next.js routes** until backend is fully tested
3. **Use feature flags** to toggle between APIs
4. **Monitor performance** - Backend should be faster
5. **Update documentation** as you migrate
6. **Create Postman collection** for all routes
7. **Set up CI/CD** for backend deployment

## 📞 Need Help?

If you get stuck:
1. Check the Next.js route file for reference
2. Look at already migrated routes for patterns
3. Test with curl/Postman before updating frontend
4. Use the migration scripts to speed up boilerplate

## ✅ Success Criteria

Migration is complete when:
- [ ] All 100+ routes migrated to backend
- [ ] All tests passing
- [ ] Frontend using backend API
- [ ] All Next.js API routes deleted
- [ ] Performance is equal or better
- [ ] Documentation updated
- [ ] Deployment successful

---

**Ready to start? Run:** `cd backend && node migrate-routes.js`
