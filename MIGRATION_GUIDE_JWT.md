# JWT Authentication Migration Guide

## Quick Reference: Replace getServerSession

This guide shows how to replace all `getServerSession` calls with JWT authentication helpers.

---

## 🎯 Quick Migration Patterns

### Pattern 1: API Routes (with NextRequest)

**BEFORE:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  // ... rest of code
}
```

**AFTER:**
```typescript
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.userId
  // ... rest of code
}
```

---

### Pattern 2: Using authMiddleware Helper

**BEFORE:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of code
}
```

**AFTER:**
```typescript
import { authMiddleware } from '@/middleware/auth'

export async function POST(req: NextRequest) {
  const auth = await authMiddleware(req)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const user = auth.user
  // ... rest of code
}
```

---

### Pattern 3: Server Components (no request object)

**BEFORE:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/login')
  }
  // ... rest of code
}
```

**AFTER:**
```typescript
import { getCurrentUser } from '@/lib/jwt-auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  // ... rest of code
}
```

---

### Pattern 4: Using getSession Helper (Universal)

**BEFORE:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In API route
const session = await getServerSession(authOptions)

// In Server Component
const session = await getServerSession(authOptions)
```

**AFTER:**
```typescript
import { getSession } from '@/lib/server-auth'

// In API route (with request)
const session = await getSession(request)

// In Server Component (without request)
const session = await getSession()
```

---

## 📦 Available Helper Functions

### From `@/lib/jwt-auth`

| Function | Use Case | Returns |
|----------|----------|---------|
| `getUserFromRequest(req)` | API routes with NextRequest | `TokenPayload \| null` |
| `getCurrentUser()` | Server components | `TokenPayload \| null` |
| `requireAuth()` | Server components (throws if not auth) | `TokenPayload` |
| `createToken(payload)` | Login/signup | `string` |
| `verifyToken(token)` | Manual token verification | `TokenPayload \| null` |

### From `@/lib/server-auth`

| Function | Use Case | Returns |
|----------|----------|---------|
| `getSession(request?)` | Universal (API + Server Components) | `Session \| null` |
| `requireSession(request?)` | Require auth (throws if not auth) | `Session` |
| `requireAdmin(request?)` | Require admin role | `Session` |

### From `@/middleware/auth`

| Function | Use Case | Returns |
|----------|----------|---------|
| `authMiddleware(request)` | API routes with structured response | `AuthResult` |
| `authorizeRoles(roles)` | Role-based authorization | `(role: string) => boolean` |

---

## 🔄 Field Name Mapping

When migrating, note the field name changes:

| getServerSession | JWT Auth |
|------------------|----------|
| `session.user.id` | `user.userId` |
| `session.user.email` | `user.email` |
| `session.user.username` | `user.username` |
| `session.user.role` | `user.role` |

---

## 📝 Complete Examples

### Example 1: Simple API Route

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use user.userId, user.email, user.username, user.role
  const posts = await getPosts(user.userId)
  return NextResponse.json({ posts })
}
```

### Example 2: Protected Server Component

```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/jwt-auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

### Example 3: Admin-Only Route

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const users = await getAllUsers()
  return NextResponse.json({ users })
}
```

### Example 4: Using authMiddleware

```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/middleware/auth'

export async function PUT(req: NextRequest) {
  const auth = await authMiddleware(req)
  
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const body = await req.json()
  await updateProfile(auth.user.id, body)
  
  return NextResponse.json({ success: true })
}
```

---

## 🔍 Find & Replace Commands

Use these commands to find all instances that need migration:

### Windows (PowerShell)
```powershell
# Find all getServerSession imports
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "getServerSession" -List

# Find all authOptions imports
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "authOptions" -List
```

### Unix/Linux/Mac
```bash
# Find all getServerSession imports
grep -r "getServerSession" --include="*.ts" --include="*.tsx" .

# Find all authOptions imports
grep -r "authOptions" --include="*.ts" --include="*.tsx" .
```

---

## ✅ Migration Checklist

- [ ] Replace `getServerSession` imports with JWT helpers
- [ ] Update field names (`session.user.id` → `user.userId`)
- [ ] Remove `authOptions` imports where no longer needed
- [ ] Test authentication in API routes
- [ ] Test authentication in Server Components
- [ ] Verify role-based authorization still works
- [ ] Update tests to mock JWT functions instead of NextAuth
- [ ] Remove unused NextAuth imports

---

## 🚨 Common Pitfalls

1. **Field Name Confusion**: Remember `session.user.id` becomes `user.userId`
2. **Null Checks**: Always check if `user` is null before accessing properties
3. **Request Object**: API routes have `request`, Server Components don't
4. **Import Paths**: Use correct import path for each helper function

---

## 📚 Additional Resources

- JWT Auth Implementation: `lib/jwt-auth.ts`
- Server Auth Helpers: `lib/server-auth.ts`
- Auth Middleware: `middleware/auth.ts`
- Original Migration Doc: `MIGRATION_JWT.md`
