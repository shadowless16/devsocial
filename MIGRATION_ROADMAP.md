# DevSocial Microservices Migration Roadmap

## Goal
Separate backend APIs from Next.js frontend to support both web and mobile clients.

## Migration Strategy: Incremental Hybrid Approach

### Phase 1: Documentation & Setup (Week 1)
- [x] Create migration branch
- [x] Generate OpenAPI specs for existing APIs
- [x] Set up backend service structure
- [x] Configure CORS and API gateway

### Phase 2: Extract Gamification Service (Week 2)
**Why First:** Self-contained, high value for mobile, minimal dependencies

**Endpoints to Extract:**
- `POST /api/gamification/award-xp`
- `GET /api/leaderboard`
- `GET /api/challenges`
- `POST /api/challenges/[id]/join`
- `POST /api/challenges/[id]/submit`

**Dependencies:**
- User model (read-only)
- Badge system utils
- XP system utils

### Phase 3: Extract Notification Service (Week 3)
**Why Second:** Real-time needed for mobile, WebSocket already separated

**Endpoints to Extract:**
- `GET /api/notifications`
- `POST /api/notifications/mark-read`
- `POST /api/notifications/mark-all-read`
- `POST /api/notifications/subscribe`

**Dependencies:**
- WebSocket server (already in lib/realtime)
- User model

### Phase 4: Extract Analytics Service (Week 4)
**Why Third:** Read-heavy, no complex mutations, easy to cache

**Endpoints to Extract:**
- `GET /api/analytics`
- `GET /api/analytics/overview`
- `GET /api/analytics/growth`
- `GET /api/dashboard`

**Dependencies:**
- Read-only database access
- Aggregation pipelines

### Phase 5: Extract Posts & Content Service (Week 5-6)
**Why Fourth:** Core feature, many dependencies, needs careful migration

**Endpoints to Extract:**
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/[id]`
- `DELETE /api/posts/[id]`
- `GET /api/feed`
- `POST /api/likes/posts/[postId]`
- `GET /api/comments/[postId]`
- `POST /api/comments/[postId]`

**Dependencies:**
- User model
- Gamification service (XP awards)
- Notification service
- File upload service

### Phase 6: Extract User Service (Week 7-8)
**Why Fifth:** Many dependencies, used by all services

**Endpoints to Extract:**
- `GET /api/users/[username]`
- `PUT /api/users/profile`
- `POST /api/users/follow/[userId]`
- `GET /api/users/[username]/followers`
- `GET /api/users/search`

**Dependencies:**
- Auth service
- Gamification service

### Phase 7: Extract Auth Service (Week 9-10)
**Why Last:** Most critical, affects everything, migrate when others stable

**Endpoints to Extract:**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`

**Dependencies:**
- JWT handling
- Session management
- Email service

## Technical Architecture

### Backend Service Structure
```
backend-api/
├── src/
│   ├── modules/
│   │   ├── gamification/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── posts/
│   │   ├── users/
│   │   └── auth/
│   ├── shared/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── utils/
│   └── server.ts
├── package.json
└── tsconfig.json
```

### Frontend Adapter Pattern
```typescript
// app/api/[service]/[...path]/route.ts
export async function GET(req: Request) {
  return fetch(`${BACKEND_URL}/api/[service]/[...path]`, {
    headers: { Authorization: req.headers.get('Authorization') }
  })
}
```

## Success Metrics
- [ ] Mobile app can authenticate
- [ ] Mobile app can fetch feed
- [ ] Mobile app can post content
- [ ] Web app continues working
- [ ] API response time < 200ms
- [ ] Zero downtime during migration

## Rollback Plan
Each service has feature flag to switch between Next.js API and backend service.

## Next Steps
1. Generate OpenAPI documentation
2. Set up backend service boilerplate
3. Extract gamification service
