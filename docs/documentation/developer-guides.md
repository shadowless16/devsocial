# Developer Guides

Technical implementation details and architecture documentation for DevSocial.

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
├─────────────────────────┬───────────────────────────────────┤
│     App Router Pages    │        Component Library         │
│   (Server Components)   │      (Client Components)         │
├─────────────────────────┼───────────────────────────────────┤
│    API Routes Layer     │        State Management          │
│   (Server-side APIs)    │    (Context + Session Cache)     │
├─────────────────────────┼───────────────────────────────────┤
│   Authentication        │        Real-time Layer           │
│    (NextAuth.js)        │        (Socket.io)               │
├─────────────────────────┼───────────────────────────────────┤
│                    Database Layer                           │
│                 (MongoDB + Mongoose)                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io Client

#### Backend
- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: UploadThing + Cloudinary
- **Real-time**: Socket.io Server

## Project Structure Deep Dive

### App Directory Structure
```typescript
app/
├── (authenticated)/          // Route group for protected pages
│   ├── layout.tsx           // Auth layout with sidebar
│   ├── page.tsx            // Main feed (/)
│   ├── dashboard/          // Analytics dashboard
│   ├── profile/            // User profiles
│   ├── leaderboard/        // XP rankings
│   ├── challenges/         // Weekly challenges
│   ├── messages/           // Direct messaging
│   └── settings/           // User settings
├── api/                    // API route handlers
│   ├── auth/              // Authentication endpoints
│   ├── posts/             // Post CRUD operations
│   ├── users/             // User management
│   ├── gamification/      // XP and badge system
│   └── ...               // Other API endpoints
├── auth/                  // Public auth pages
│   ├── login/
│   └── signup/
└── layout.tsx            // Root layout
```

### Component Architecture
```typescript
components/
├── ui/                   // Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── feed/                 // Feed-specific components
│   ├── Feed.tsx         // Main feed container
│   ├── FeedItem.tsx     // Individual post component
│   └── comment-item.tsx // Comment display
├── gamification/         // XP and gamification UI
│   ├── xp-bar.tsx
│   ├── rank-display.tsx
│   └── xp-notification.tsx
├── layout/               // Layout components
│   ├── nav-sidebar.tsx
│   └── right-sidebar.tsx
└── shared/               // Reusable components
    ├── UserLink.tsx
    ├── FollowButton.tsx
    └── PostContent.tsx
```

## Core Systems

### Authentication System

#### NextAuth.js Configuration
```typescript
// lib/auth-config.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Custom authentication logic
        const user = await authenticateUser(credentials)
        return user ? { ...user, id: user._id } : null
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      return session
    }
  }
}
```

#### Auth Context Implementation
```typescript
// contexts/auth-context.tsx
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)

  // Implementation details...
}
```

### Database Models

#### User Model
```typescript
// models/User.ts
interface IUser extends Document {
  username: string
  email: string
  fullName: string
  bio?: string
  avatar?: string
  xp: number
  level: number
  badges: string[]
  affiliation?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  bio: { type: String, maxlength: 500 },
  avatar: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  affiliation: String,
  isVerified: { type: Boolean, default: false }
}, { timestamps: true })
```

#### Post Model
```typescript
// models/Post.ts
interface IPost extends Document {
  content: string
  author: ObjectId
  tags: string[]
  media: string[]
  isAnonymous: boolean
  likesCount: number
  commentsCount: number
  viewsCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Gamification System

#### XP Award System
```typescript
// utils/xp-system.ts
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  CREATE_POST: 25,
  RECEIVE_LIKE: 5,
  CREATE_COMMENT: 10,
  COMPLETE_CHALLENGE: 100,
  FIRST_POST: 50,
  PROFILE_COMPLETE: 30
} as const

export async function awardXP(
  userId: string, 
  action: keyof typeof XP_REWARDS, 
  multiplier: number = 1
): Promise<void> {
  const xpAmount = XP_REWARDS[action] * multiplier
  
  await User.findByIdAndUpdate(userId, {
    $inc: { xp: xpAmount }
  })
  
  // Check for level up
  await checkLevelUp(userId)
  
  // Log XP transaction
  await XPLog.create({
    userId,
    action,
    xpAmount,
    timestamp: new Date()
  })
}
```

#### Badge System
```typescript
// utils/badge-system.ts
export const BADGES = {
  EARLY_ADOPTER: {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: '🚀'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Gained 100 followers',
    icon: '🦋'
  }
  // ... more badges
} as const

export async function checkBadgeEligibility(userId: string): Promise<void> {
  const user = await User.findById(userId)
  const stats = await getUserStats(userId)
  
  // Check each badge condition
  for (const badge of Object.values(BADGES)) {
    if (!user.badges.includes(badge.id)) {
      const eligible = await isBadgeEligible(badge.id, stats)
      if (eligible) {
        await awardBadge(userId, badge.id)
      }
    }
  }
}
```

### Real-time Features

#### WebSocket Server Setup
```typescript
// lib/websocket-server.ts
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export function initializeWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`)
    })

    socket.on('new_post', async (postData) => {
      // Broadcast to followers
      const followers = await getFollowers(postData.authorId)
      followers.forEach(followerId => {
        socket.to(`user_${followerId}`).emit('new_post', postData)
      })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}
```

#### WebSocket Client Context
```typescript
// contexts/websocket-context.tsx
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!)
      
      newSocket.on('connect', () => {
        setIsConnected(true)
        newSocket.emit('join_user_room', user.id)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
```

## API Design Patterns

### Standardized Response Format
```typescript
// utils/response.ts
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export function successResponse<T>(data: T, message?: string): APIResponse<T> {
  return { success: true, data, message }
}

export function errorResponse(error: string, statusCode: number = 400): APIResponse {
  return { success: false, error }
}
```

### Request Validation with Zod
```typescript
// utils/validation.ts
import { z } from 'zod'

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).max(10),
  isAnonymous: z.boolean().default(false),
  media: z.array(z.string().url()).max(4)
})

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional()
})
```

### API Route Handler Pattern
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { CreatePostSchema } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        errorResponse('Authentication required'), 
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreatePostSchema.parse(body)

    const post = await createPost({
      ...validatedData,
      authorId: session.user.id
    })

    return NextResponse.json(
      successResponse(post, 'Post created successfully'),
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        errorResponse('Validation error', error.errors),
        { status: 400 }
      )
    }

    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    )
  }
}
```

## Performance Optimizations

### Database Indexing
```typescript
// Database indexes for optimal performance
UserSchema.index({ username: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ xp: -1 }) // For leaderboard queries

PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ createdAt: -1 }) // For feed queries

FollowSchema.index({ follower: 1, following: 1 })
FollowSchema.index({ following: 1 }) // For follower lists
```

### Caching Strategy
```typescript
// lib/cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedData(
  key: string, 
  data: any, 
  ttl: number = 300
): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(data))
}

// Usage in API routes
export async function getLeaderboard() {
  const cacheKey = 'leaderboard:weekly'
  let leaderboard = await getCachedData(cacheKey)
  
  if (!leaderboard) {
    leaderboard = await User.find()
      .sort({ xp: -1 })
      .limit(50)
      .select('username fullName avatar xp level')
    
    await setCachedData(cacheKey, leaderboard, 600) // 10 minutes
  }
  
  return leaderboard
}
```

### Image Optimization
```typescript
// components/ui/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className
}) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  )
}
```

## Testing Strategy

### Unit Testing Setup
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts'
  ]
}
```

### Component Testing Example
```typescript
// __tests__/components/FeedItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedItem } from '@/components/feed/FeedItem'

const mockPost = {
  id: '1',
  content: 'Test post content',
  author: {
    username: 'testuser',
    fullName: 'Test User',
    avatar: '/test-avatar.jpg'
  },
  likesCount: 5,
  commentsCount: 2,
  isLiked: false,
  createdAt: '2024-01-15T10:30:00Z'
}

describe('FeedItem', () => {
  it('renders post content correctly', () => {
    render(<FeedItem post={mockPost} />)
    
    expect(screen.getByText('Test post content')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // likes count
  })

  it('handles like button click', () => {
    const onLike = jest.fn()
    render(<FeedItem post={mockPost} onLike={onLike} />)
    
    fireEvent.click(screen.getByRole('button', { name: /like/i }))
    expect(onLike).toHaveBeenCalledWith(mockPost.id)
  })
})
```

## Deployment Guide

### Environment Configuration
```bash
# .env.production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devsocial
JWT_SECRET=your-jwt-secret
UPLOADTHING_SECRET=your-uploadthing-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

## Security Best Practices

### Input Sanitization
```typescript
// utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre'],
    ALLOWED_ATTR: []
  })
}

export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 2000) // Limit length
}
```

### Rate Limiting
```typescript
// middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function rateLimit(
  request: NextRequest,
  limit: number = 100,
  window: number = 60
) {
  const ip = request.ip || 'unknown'
  const key = `rate_limit:${ip}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  if (current > limit) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  return null
}
```

This developer guide provides comprehensive technical documentation for understanding and contributing to the DevSocial platform architecture.