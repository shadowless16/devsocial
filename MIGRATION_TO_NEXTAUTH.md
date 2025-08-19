# Migration from Custom JWT to NextAuth.js

## What Changed

### ✅ Removed
- Custom JWT token generation and verification
- `jsonwebtoken` dependency
- Custom `AuthService.generateTokens()` and `AuthService.verifyToken()` methods
- Custom login endpoint with JWT tokens
- Manual token management in signup

### ✅ Kept & Enhanced
- NextAuth.js configuration (already existed)
- Session-based authentication
- MongoDB adapter
- Password reset functionality
- All existing middleware protection

## Updated Files

1. **package.json** - Removed `jsonwebtoken` dependency
2. **lib/auth.ts** - Removed custom JWT methods, kept NextAuth config
3. **app/api/auth/login/route.ts** - Now redirects to NextAuth
4. **app/api/auth/signup/route.ts** - Removed JWT, returns success message
5. **app/providers.tsx** - Added NextAuth SessionProvider
6. **lib/auth-client.ts** - New client-side auth helper

## Environment Variables

Update your `.env.local`:

```bash
# Required for NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Remove these (no longer needed)
# JWT_SECRET=...
```

## Frontend Changes Needed

### Before (Custom JWT):
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ usernameOrEmail, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// API calls
fetch('/api/posts', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### After (NextAuth):
```typescript
// Login
import { signIn } from 'next-auth/react';
await signIn('credentials', { usernameOrEmail, password });

// API calls (automatic session handling)
fetch('/api/posts', {
  credentials: 'include' // Includes session cookie
});

// Or use the helper
import { useAuth } from '@/lib/auth-client';
const { login, user, isAuthenticated } = useAuth();
```

## Benefits of This Migration

1. **Better Security**: NextAuth handles CSRF, token rotation, secure cookies
2. **Simpler Code**: No manual token management
3. **Built-in Features**: Session persistence, automatic refresh
4. **Industry Standard**: NextAuth is the de facto auth solution for Next.js
5. **Better UX**: Automatic session restoration on page refresh

## Next Steps

1. Update your frontend components to use NextAuth hooks
2. Remove any localStorage token management
3. Update API calls to use session cookies instead of Authorization headers
4. Test the authentication flow
5. Deploy with proper NEXTAUTH_SECRET in production

## Testing

```bash
# Install dependencies
npm install

# Run the app
npm run dev

# Test authentication flow:
# 1. Go to /auth/signup - create account
# 2. Go to /auth/login - sign in
# 3. Should redirect to /home with session
```