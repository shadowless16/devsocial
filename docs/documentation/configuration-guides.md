# Configuration Guides

Environment setup and deployment instructions for DevSocial.

## Development Environment Setup

### Prerequisites

#### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **MongoDB**: Local installation or Atlas account
- **Git**: For version control

#### Optional Tools
- **MongoDB Compass**: GUI for database management
- **Postman**: API testing
- **VS Code**: Recommended IDE with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter

### Initial Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd devsocial-frontend
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Environment Configuration
Create `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/devsocial
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devsocial

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# File Upload (UploadThing)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Cloudinary (Optional - for image processing)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# Development Settings
NODE_ENV=development
```

#### 4. Database Setup

##### Local MongoDB
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/db

# Create database and collections (optional - will be created automatically)
mongo
use devsocial
```

##### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string and add to `.env.local`

#### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/devsocial` |
| `NEXTAUTH_URL` | Application URL for NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth encryption | `your-secret-key` |
| `JWT_SECRET` | Secret for JWT token signing | `your-jwt-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UPLOADTHING_SECRET` | UploadThing API secret | - |
| `UPLOADTHING_APP_ID` | UploadThing application ID | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `SMTP_HOST` | Email SMTP host | - |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |

## Database Configuration

### MongoDB Schema Setup

The application uses Mongoose ODM with automatic schema creation. Key collections:

#### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  fullName: String,
  bio: String,
  avatar: String,
  xp: Number (default: 0),
  level: Number (default: 1),
  badges: [String],
  affiliation: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

#### Posts Collection
```javascript
{
  content: String,
  author: ObjectId (ref: User),
  tags: [String],
  media: [String],
  isAnonymous: Boolean (default: false),
  likesCount: Number (default: 0),
  commentsCount: Number (default: 0),
  viewsCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

For optimal performance, create these indexes:

```javascript
// User indexes
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "xp": -1 }) // For leaderboard

// Post indexes
db.posts.createIndex({ "author": 1, "createdAt": -1 })
db.posts.createIndex({ "tags": 1 })
db.posts.createIndex({ "createdAt": -1 }) // For feed

// Follow indexes
db.follows.createIndex({ "follower": 1, "following": 1 })
db.follows.createIndex({ "following": 1 })
```

## Third-Party Service Configuration

### UploadThing Setup

1. **Create Account**
   - Visit [UploadThing](https://uploadthing.com)
   - Create account and new app

2. **Get API Keys**
   - Copy Secret and App ID
   - Add to environment variables

3. **Configure File Types**
   ```typescript
   // app/api/uploadthing/core.ts
   export const ourFileRouter = {
     imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
       .middleware(async ({ req }) => {
         const session = await getServerSession(authOptions)
         if (!session) throw new Error("Unauthorized")
         return { userId: session.user.id }
       })
       .onUploadComplete(async ({ metadata, file }) => {
         console.log("Upload complete for userId:", metadata.userId)
         return { uploadedBy: metadata.userId }
       })
   }
   ```

### Cloudinary Setup (Optional)

1. **Create Account**
   - Visit [Cloudinary](https://cloudinary.com)
   - Create free account

2. **Get Credentials**
   - Copy Cloud Name, API Key, API Secret
   - Add to environment variables

3. **Configure Transformations**
   ```typescript
   // lib/cloudinary.ts
   import { v2 as cloudinary } from 'cloudinary'

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   })

   export const uploadImage = async (file: File) => {
     const result = await cloudinary.uploader.upload(file, {
       folder: 'devsocial',
       transformation: [
         { width: 800, height: 600, crop: 'limit' },
         { quality: 'auto' },
         { format: 'auto' }
       ]
     })
     return result.secure_url
   }
   ```

### Email Configuration (SMTP)

#### Gmail Setup
1. **Enable 2FA** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to Environment**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

#### Other Email Providers
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Production Deployment

### Vercel Deployment

#### 1. Prepare for Deployment
```bash
# Build the application locally to test
npm run build
npm start
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
# ... add all required variables
```

#### 3. Configure Domain
```bash
# Add custom domain
vercel domains add your-domain.com
```

### Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/devsocial
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

#### 3. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

### AWS Deployment

#### 1. Using AWS Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### 2. Using AWS ECS
```yaml
# docker-compose.aws.yml
version: '3.8'

services:
  app:
    image: your-ecr-repo/devsocial:latest
    ports:
      - "80:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/devsocial
        awslogs-region: us-east-1
```

## Performance Configuration

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['uploadthing.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  // Enable SWC minification
  swcMinify: true,
  // Optimize bundle
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
```

### Database Optimization

#### Connection Pooling
```typescript
// lib/db.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
```

### Caching Configuration

#### Redis Setup (Optional)
```typescript
// lib/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
})

export default redis
```

## Security Configuration

### Content Security Policy
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' wss: ws:;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

#### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://staging.devsocial.com/api
NEXT_PUBLIC_WS_URL=https://staging.devsocial.com
```

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://devsocial.com/api
NEXT_PUBLIC_WS_URL=https://devsocial.com
```

## Monitoring and Logging

### Application Monitoring
```typescript
// lib/monitoring.ts
export const logError = (error: Error, context?: any) => {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  })

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}

export const logActivity = (action: string, userId?: string, metadata?: any) => {
  console.log('User Activity:', {
    action,
    userId,
    metadata,
    timestamp: new Date().toISOString()
  })
}
```

This configuration guide provides comprehensive setup instructions for all environments and deployment scenarios.