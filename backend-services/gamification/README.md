# Gamification Microservice

Standalone service for XP, badges, challenges, and leaderboards.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run in development
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Endpoints

- `POST /api/gamification/award-xp` - Award XP (requires auth)
- `GET /api/leaderboard?type=all-time&limit=50` - Get leaderboard
- `GET /api/challenges` - Get active challenges
- `POST /api/challenges/:id/join` - Join challenge (requires auth)
- `POST /api/challenges/:id/submit` - Submit solution (requires auth)

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/devsocial
GAMIFICATION_PORT=3001
JWT_SECRET=your-jwt-secret
```

## Next Steps

1. Complete model imports (User, UserStats, XPLog)
2. Implement full XP award logic
3. Add challenge system
4. Set up shared models package
5. Add tests
