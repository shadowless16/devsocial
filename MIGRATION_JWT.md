# JWT Authentication Migration Guide

## What Changed
- **Removed**: NextAuth.js
- **Added**: Pure JWT authentication with `jose` library
- **Cookie**: `auth-token` (HTTP-only, secure in production)
- **Secret**: Hardcoded in `lib/jwt-auth.ts`

## Core Files

### 1. Authentication Logic
- `lib/jwt-auth.ts` - All JWT functions (create, verify, get user)

### 2. API Routes
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint  
- `app/api/auth/session/route.ts` - Get current session
- `app/api/auth/signup/route.ts` - Signup (needs update)

### 3. Middleware
- `middleware.ts` - Uses `getUserFromRequest()` from jwt-auth

### 4. Context
- `contexts/app-context.tsx` - Fetches session from `/api/auth/session`

### 5. Login Page
- `app/auth/login/page.tsx` - Calls `/api/auth/login` API

## How to Use

### In API Routes
```typescript
import { getUserFromRequest, requireAuth } from '@/lib/jwt-auth'

// Optional auth
const user = await getUserFromRequest(request)

// Required auth (throws if not authenticated)
const user = await requireAuth()
```

### In Server Components
```typescript
import { getCurrentUser } from '@/lib/jwt-auth'

const user = await getCurrentUser()
```

### In Client Components
```typescript
import { useAuth } from '@/contexts/app-context'

const { user, loading, isAuthenticated } = useAuth()
```

### Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usernameOrEmail, password }),
})
```

### Logout
```typescript
await fetch('/api/auth/logout', { method: 'POST' })
window.location.href = '/auth/login'
```

## Files That Still Need Updates
- All API routes that use `getServerSession` 
- Components using `useSession` from next-auth
- Any `signIn`, `signOut` calls

## Testing Checklist
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Session persists across page refreshes
- [ ] Middleware blocks unauthenticated users
- [ ] API routes can access user data
