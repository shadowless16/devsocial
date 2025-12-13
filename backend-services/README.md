# DevSocial Backend Services

Microservices architecture for DevSocial platform.

## Services

### Gamification Service (Port 3001)
- XP awards and tracking
- Leaderboards (all-time, weekly, monthly)
- Challenges management
- Badge system

## Setup

Each service has its own package.json. Install dependencies:

```bash
cd backend-services/gamification
pnpm install
```

## Running Services

Development mode:
```bash
cd backend-services/gamification
pnpm dev
```

Production:
```bash
pnpm build
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env` in each service directory and configure.

## Next Steps

1. Complete gamification service implementation
2. Add authentication middleware
3. Extract notification service
4. Extract analytics service
5. Set up API gateway
