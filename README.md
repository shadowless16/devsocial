# DevSocial Frontend - Developer Social Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Component Documentation](#component-documentation)
- [State Management](#state-management)
- [Real-Time Features](#real-time-features)
- [Deployment](#deployment)

## 🎯 Overview

DevSocial is a gamified social media platform designed specifically for developers and tech enthusiasts. It combines traditional social networking features with game-like elements (XP, levels, badges, challenges) to create an engaging community where developers can share knowledge, showcase projects, and build their professional reputation.

### Key Differentiators
- **Gamification System**: XP points, levels, badges, and leaderboards drive engagement
- **Developer-Focused**: Built by developers for developers with code-sharing capabilities
- **Real-Time Features**: WebSocket-powered live updates, notifications, and messaging
- **Career Growth**: Profile showcases, referral system, and skill-based challenges
- **Community-Driven**: Moderation tools, anonymous posting options, and collaborative features

## 🏗️ Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14 App                        │
├─────────────────────────┬───────────────────────────────────┤
│     Pages & Routing     │        Components Layer          │
│  (App Directory Based)  │   (Reusable UI Components)       │
├─────────────────────────┼───────────────────────────────────┤
│    State Management     │        API Layer                 │
│  (Context + Next-Auth)  │   (Centralized API Client)       │
├─────────────────────────┼───────────────────────────────────┤
│   Real-Time Layer       │        Data Models               │
│    (Socket.io)          │    (TypeScript Interfaces)       │
└─────────────────────────┴───────────────────────────────────┘
```

### Authentication Flow
- **NextAuth.js** integration for secure authentication
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh mechanism
- Role-based access control (User, Moderator, Admin)

## ✨ Features

### 🎮 Gamification System
- **XP & Levels**: Earn XP for activities (posts, likes, comments, daily login)
- **Badges**: Achievement system with 15+ unique badges
- **Leaderboards**: Real-time rankings (all-time, weekly, monthly)
- **Challenges**: Weekly coding challenges with XP rewards
- **Rank System**: Progress from Rookie to Elite Developer

### 📱 Social Features
- **Posts**: Rich text posts with code highlighting, images, and tags
- **Comments**: Nested comments with likes
- **Likes**: Real-time like counts with animations
- **Following**: Follow other developers
- **Anonymous Posts**: "Confess" feature for anonymous sharing
- **Profiles**: Comprehensive user profiles with stats and activity

### 💬 Messaging (In Development)
- Private one-on-one conversations
- Real-time message delivery
- Read receipts and typing indicators
- File and image sharing
- Message reactions

### 📊 Analytics Dashboard
- **Activity Charts**: Daily/weekly/monthly activity visualization
- **XP Breakdown**: Sources of XP earnings
- **Engagement Metrics**: Post performance analytics
- **Goal Tracking**: Personal goals and progress
- **Contribution Stats**: Overall platform contributions

### 🔍 Search & Discovery
- **Advanced Search**: Filter by posts, users, tags
- **Trending**: Algorithm-based trending content
- **Real-time Results**: Instant search as you type
- **Tag System**: Hashtag-based content discovery

### 🎯 Additional Features
- **Referral System**: Invite friends and earn rewards
- **Dark Mode**: Full theme support
- **Mobile Responsive**: PWA-ready design
- **Notifications**: Real-time notifications with WebSocket
- **Moderation**: Report system and admin tools

## 📁 Project Structure

```
devsocial-frontend/
├── app/                          # Next.js 14 App Directory
│   ├── (authenticated)/          # Protected routes
│   │   ├── page.tsx             # Main feed
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── profile/             # User profiles
│   │   ├── leaderboard/         # Rankings
│   │   ├── challenges/          # Weekly challenges
│   │   ├── messages/            # Messaging (WIP)
│   │   ├── settings/            # User settings
│   │   └── ...                  # Other authenticated pages
│   ├── auth/                    # Authentication pages
│   │   ├── login/              # Login page
│   │   └── signup/             # Registration
│   ├── api/                     # API routes
│   │   ├── auth/               # Auth endpoints
│   │   ├── posts/              # Posts CRUD
│   │   ├── users/              # User management
│   │   └── ...                 # Other API endpoints
│   └── layout.tsx              # Root layout
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── feed/                    # Feed-related components
│   ├── gamification/            # XP, badges, levels
│   ├── layout/                  # Layout components
│   ├── modals/                  # Modal dialogs
│   └── shared/                  # Shared components
│
├── contexts/                     # React contexts
│   ├── auth-context.tsx         # Authentication state
│   └── websocket-context.tsx    # WebSocket connection
│
├── lib/                         # Utilities and configs
│   ├── api-client.ts           # Centralized API client
│   ├── db.ts                   # Database connection
│   └── utils.ts                # Helper functions
│
├── models/                      # Mongoose schemas
│   ├── User.ts                 # User model
│   ├── Post.ts                 # Post model
│   ├── Comment.ts              # Comment model
│   └── ...                     # Other models
│
├── hooks/                       # Custom React hooks
├── utils/                       # Utility functions
└── types/                       # TypeScript types
```

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI based)
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod

### Additional Libraries
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **File Upload**: UploadThing
- **Image Processing**: Cloudinary
- **Animations**: Framer Motion
- **Code Highlighting**: React Syntax Highlighter
- **Markdown**: React Markdown

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd devsocial-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Run database migrations (if any)**
```bash
npm run migrate
```

5. **Start development server**
```bash
npm run dev
# or
yarn dev
```

6. **Open browser**
Navigate to `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devsocial

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
JWT_SECRET=your-jwt-secret-here

# File Upload
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Cloudinary (Optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WebSocket
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Public API URL
NEXT_PUBLIC_API_BASE_URL=/api
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/[username]` - Get user by username
- `POST /api/users/follow/[userId]` - Follow/unfollow user
- `GET /api/users/[username]/followers` - Get user followers
- `GET /api/users/[username]/following` - Get user following

### Posts & Content
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/likes/posts/[postId]` - Like/unlike post

### Comments
- `GET /api/comments/[postId]` - Get post comments
- `POST /api/comments/[postId]` - Add comment
- `DELETE /api/comments/delete/[commentId]` - Delete comment
- `POST /api/likes/comments/[commentId]` - Like/unlike comment

### Gamification
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/challenges` - Get active challenges
- `POST /api/challenges/[challengeId]/join` - Join challenge
- `POST /api/challenges/[challengeId]/submit` - Submit challenge solution

### Analytics
- `GET /api/dashboard` - Get dashboard analytics
- `GET /api/analytics` - Get detailed analytics

## 🧩 Component Documentation

### Core Components

#### FeedItem
Displays individual posts in the feed
```tsx
<FeedItem
  post={postData}
  onLike={handleLike}
  onComment={handleComment}
  onDelete={handleDelete}
/>
```

#### XPBar
Shows user's XP progress and level
```tsx
<XPBar />  // Automatically uses current user context
```

#### PostModal
Modal for creating new posts
```tsx
<PostModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onPostCreate={handlePostCreate}
/>
```

#### NavSidebar
Main navigation sidebar
```tsx
<NavSidebar onItemClick={handleNavClick} />
```

### UI Components (shadcn/ui)
All base UI components are customizable and follow the shadcn/ui pattern:
- Button, Card, Dialog, Select, Input, etc.
- Located in `components/ui/`
- Styled with Tailwind CSS
- Fully accessible (ARIA compliant)

## 🔄 State Management

### Authentication Context
Manages user authentication state using NextAuth.js
```tsx
const { user, loading, login, logout, updateUser } = useAuth()
```

### WebSocket Context
Manages real-time connections
```tsx
const { socket, isConnected, sendMessage, joinConversation } = useWebSocket()
```

### Session Cache Context
Optimizes API calls with intelligent caching
```tsx
const { getCachedData, setCachedData } = useSessionCache()
```

## 🌐 Real-Time Features

### WebSocket Events
- `new_post` - New post in feed
- `new_notification` - User notifications
- `new_message` - Chat messages
- `user_typing` - Typing indicators
- `post_liked` - Real-time like updates
- `xp_gained` - XP animations

### Implementation Example
```tsx
useEffect(() => {
  if (socket) {
    socket.on('new_notification', (data) => {
      // Handle notification
    })
    
    return () => socket.off('new_notification')
  }
}, [socket])
```

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Connect GitHub repository
- Configure environment variables
- Deploy

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic with Next.js App Router
- **API Caching**: Request deduplication and session caching
- **Static Generation**: Where possible for better performance
- **Progressive Web App**: Offline support and installability

## 🔒 Security Features

- **Input Validation**: Zod schemas for all inputs
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built into NextAuth.js
- **Rate Limiting**: API endpoint protection
- **Secure Headers**: Configured in next.config.js

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines (if applicable)

## 📄 License

This project is proprietary and confidential.

---

Built with ❤️ by the DevSocial Team (Ak David)
