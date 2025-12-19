# DevSocial Backend API

Express.js backend for DevSocial platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start development server
pnpm dev

# Backend runs on http://localhost:4000
```

## 📊 Migration Status

**Total Routes:** 124  
**Completed:** 6 (5%)  
**Remaining:** 118 (95%)

### ✅ Completed Routes
- Auth (signup, login)
- Users (profile, follow)
- Posts (CRUD)
- Comments (GET, POST, DELETE)
- Likes (posts, comments)
- Gamification (XP, leaderboard)
- Notifications (get, mark read)
- Analytics (overview, growth)

### ⏳ In Progress
See [FULL_MIGRATION_GUIDE.md](../FULL_MIGRATION_GUIDE.md) for complete list.

## 🛠️ Migration Tools

### 1. Scan All Routes
```bash
node migrate-routes.js
```
Shows all Next.js routes that need migration with priorities.

### 2. Generate Route Boilerplate
```bash
node generate-routes.js <category>
# Example: node generate-routes.js feed
```
Auto-generates Express route file with boilerplate.

### 3. Quick Migrate Priority 1
```bash
bash quick-migrate.sh
```
Generates all Priority 1 routes at once.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.ts   # JWT authentication
│   ├── models/                  # Mongoose models (36 models)
│   ├── routes/                  # Express routes
│   │   ├── auth.routes.ts       # ✅ Done
│   │   ├── user.routes.ts       # ✅ Done
│   │   ├── post.routes.ts       # ✅ Done
│   │   ├── comment.routes.ts    # ✅ Done
│   │   ├── like.routes.ts       # ✅ Done
│   │   ├── gamification.routes.ts # ✅ Done
│   │   ├── notification.routes.ts # ✅ Done
│   │   ├── analytics.routes.ts  # ✅ Done
│   │   └── ...                  # ⏳ To be created
│   ├── utils/                   # Utility functions (23 utils)
│   └── server.ts                # Main Express app
├── migrate-routes.js            # Route scanner
├── generate-routes.js           # Route generator
├── quick-migrate.sh             # Quick migration script
└── package.json
```

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devsocial

# Server
BACKEND_PORT=4000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-jwt-secret-here

# Optional
NODE_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:username` - Get user by username
- `POST /api/users/follow/:userId` - Follow/unfollow user

### Posts
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments/:postId` - Create comment
- `DELETE /api/comments/:commentId` - Delete comment

### Likes
- `POST /api/likes/posts/:postId` - Like/unlike post
- `POST /api/likes/comments/:commentId` - Like/unlike comment

### Gamification
- `POST /api/gamification/award-xp` - Award XP to user
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/user-progress` - Get user progress

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/mark-read` - Mark notification as read
- `PUT /api/notifications/mark-unread` - Mark notification as unread

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/growth` - Get growth metrics

## 🧪 Testing

```bash
# Run tests
pnpm test

# Test specific route
curl http://localhost:4000/api/health

# Test with auth
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/users/profile
```

## 📝 Adding New Routes

### Method 1: Auto-generate
```bash
node generate-routes.js <category>
```

### Method 2: Manual
1. Create file: `src/routes/<category>.routes.ts`
2. Implement routes using Express Router
3. Add to `server.ts`:
```typescript
import categoryRoutes from './routes/category.routes'
app.use('/api/category', categoryRoutes)
```

## 🚢 Deployment

### Development
```bash
pnpm dev
```

### Production
```bash
pnpm build
pnpm start
```

### Docker
```bash
docker build -t devsocial-backend .
docker run -p 4000:4000 devsocial-backend
```

## 📚 Documentation

- [Full Migration Guide](../FULL_MIGRATION_GUIDE.md) - Complete migration instructions
- [Migration Plan](../MIGRATION_PLAN.md) - Original migration analysis
- [Backend Setup](../BACKEND_SETUP_COMPLETE.md) - Initial setup guide

## 🤝 Contributing

1. Pick a route category from Priority 1-8
2. Generate boilerplate: `node generate-routes.js <category>`
3. Implement route logic
4. Test thoroughly
5. Update this README with completed routes

## 📊 Progress Tracking

Track migration progress:
```bash
node migrate-routes.js
```

## 🔗 Related

- Frontend: `../app/` (Next.js)
- Models: `./src/models/` (Mongoose schemas)
- Utils: `./src/utils/` (Helper functions)

---

**Current Status:** 🟡 In Active Migration  
**Target:** Migrate all 124 routes by end of month  
**Priority:** Focus on Priority 1-3 routes first
