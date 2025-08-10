# Project Structure

Complete folder structure and organization for DevSocial.

## Overview

DevSocial follows Next.js 14 App Router conventions with a well-organized structure for scalability and maintainability.

## Root Directory Structure

```
devsocial-frontend/
├── .amazonq/                     # Amazon Q AI assistant rules
├── .next/                        # Next.js build output (auto-generated)
├── app/                          # Next.js 14 App Directory
├── components/                   # Reusable React components
├── contexts/                     # React Context providers
├── docs/                         # Project documentation
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries and configurations
├── middleware/                   # Next.js middleware
├── models/                       # MongoDB/Mongoose schemas
├── public/                       # Static assets
├── scripts/                      # Database and utility scripts
├── styles/                       # Global styles
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
├── .env.local                    # Environment variables (local)
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project overview
```

## Detailed Structure

### App Directory (`/app`)

Next.js 14 App Router structure with route groups and layouts.

```
app/
├── (authenticated)/              # Route group for protected pages
│   ├── layout.tsx               # Auth layout with sidebar navigation
│   ├── page.tsx                 # Main feed page (/)
│   ├── challenges/              # Weekly coding challenges
│   │   └── page.tsx
│   ├── confess/                 # Anonymous posting
│   │   └── page.tsx
│   ├── dashboard/               # Analytics dashboard
│   │   └── page.tsx
│   ├── home/                    # Alternative home page
│   │   └── page.tsx
│   ├── leaderboard/             # XP rankings
│   │   └── page.tsx
│   ├── messages/                # Direct messaging
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── missions/                # Gamification missions
│   │   └── page.tsx
│   ├── moderation/              # Content moderation
│   │   └── page.tsx
│   ├── post/                    # Individual post pages
│   │   └── [id]/
│   │       └── page.tsx
│   ├── profile/                 # User profiles
│   │   ├── page.tsx            # Current user profile
│   │   └── [username]/         # Other user profiles
│   │       └── page.tsx
│   ├── referrals/               # Referral system
│   │   └── page.tsx
│   ├── search/                  # Search functionality
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── settings/                # User settings
│   │   └── page.tsx
│   └── trending/                # Trending content
│       └── page.tsx
├── api/                         # API route handlers
│   ├── affiliations/            # University/company affiliations
│   ├── analytics/               # Analytics data
│   ├── auth/                    # Authentication endpoints
│   │   ├── [...nextauth]/       # NextAuth.js handler
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── reset-password/
│   │   ├── signup/
│   │   └── verify-email/
│   ├── challenges/              # Challenge management
│   │   ├── [challengeId]/
│   │   │   ├── join/
│   │   │   └── submit/
│   │   ├── leaderboard/
│   │   ├── recommended/
│   │   └── user/
│   ├── comments/                # Comment CRUD operations
│   │   ├── [postId]/
│   │   └── delete/
│   │       └── [commentId]/
│   ├── dashboard/               # Dashboard data
│   ├── feed/                    # Feed algorithm
│   ├── gamification/            # XP and badge system
│   │   └── award-xp/
│   ├── leaderboard/             # Rankings data
│   ├── likes/                   # Like system
│   │   ├── comments/
│   │   │   └── [commentId]/
│   │   └── posts/
│   │       └── [postId]/
│   ├── messages/                # Messaging system
│   │   ├── [conversationId]/
│   │   │   ├── [messageId]/
│   │   │   │   └── reactions/
│   │   │   └── route.ts
│   │   └── conversations/
│   ├── missions/                # Mission system
│   │   ├── [id]/
│   │   │   ├── join/
│   │   │   └── progress/
│   │   └── join/
│   ├── mod/                     # Moderation tools
│   │   └── reports/
│   │       ├── [id]/
│   │       │   └── status/
│   │       └── route.ts
│   ├── notifications/           # Notification system
│   │   ├── mark-all-read/
│   │   └── route.ts
│   ├── posts/                   # Post CRUD operations
│   │   ├── [id]/
│   │   │   ├── views/
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── profile/                 # Profile management
│   │   ├── activity/
│   │   ├── stats/
│   │   └── route.ts
│   ├── referrals/               # Referral system
│   │   ├── check-all/
│   │   ├── create/
│   │   └── stats/
│   ├── reports/                 # Content reporting
│   ├── search/                  # Search functionality
│   │   ├── advanced/
│   │   └── route.ts
│   ├── tags/                    # Hashtag system
│   │   ├── search/
│   │   └── route.ts
│   ├── trending/                # Trending algorithm
│   ├── upload/                  # File upload
│   │   ├── avatar/
│   │   └── route.ts
│   ├── uploadthing/             # UploadThing integration
│   │   ├── core.ts
│   │   └── route.ts
│   ├── users/                   # User management
│   │   ├── [username]/
│   │   │   ├── followers/
│   │   │   ├── following/
│   │   │   └── route.ts
│   │   ├── block/
│   │   │   └── [userId]/
│   │   ├── follow/
│   │   │   └── [userId]/
│   │   ├── onboarding/
│   │   ├── profile/
│   │   └── search/
│   └── well-known/              # Well-known endpoints
├── auth/                        # Public authentication pages
│   ├── login/
│   │   ├── page-backup.tsx
│   │   ├── page-original.tsx
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── onboarding/                  # User onboarding flow
│   └── page.tsx
├── test-upload/                 # Upload testing page
│   └── page.tsx
├── global-error.tsx             # Global error boundary
├── globals.css                  # Global styles
├── layout.tsx                   # Root layout
├── not-found.tsx                # 404 page
└── page.tsx                     # Landing page
```

### Components Directory (`/components`)

Organized by feature and reusability.

```
components/
├── ui/                          # Base UI components (shadcn/ui)
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   └── ... (50+ UI components)
├── auth/                        # Authentication components
│   └── auth-wrapper.tsx
├── challenges/                  # Challenge-related components
│   ├── RecommendedChallenges.tsx
│   └── weekly-challenges.tsx
├── feed/                        # Feed components
│   ├── Feed.tsx                # Main feed container
│   ├── FeedItem.tsx            # Individual post component
│   └── comment-item.tsx        # Comment display
├── gamification/                # XP and gamification UI
│   ├── rank-display.tsx
│   ├── xp-bar.tsx
│   └── xp-notification.tsx
├── layout/                      # Layout components
│   ├── auth-layout-client.tsx
│   ├── nav-sidebar.tsx         # Main navigation
│   └── right-sidebar.tsx       # Secondary content
├── leaderboard/                 # Leaderboard components
│   └── enhanced-leaderboard.tsx
├── missions/                    # Mission components
│   └── MissionCard.tsx
├── modals/                      # Modal dialogs
│   └── post-modal.tsx
├── notifications/               # Notification system
│   └── notification-center.tsx
├── onboarding/                  # User onboarding
│   ├── avatar-setup.tsx
│   ├── interest-tags.tsx
│   ├── starter-badge.tsx
│   ├── tech-profile.tsx
│   └── welcome-gamification.tsx
├── profile/                     # Profile components
│   ├── AchievementShowcase.tsx
│   ├── ActivityFeed.tsx
│   ├── badge-item.tsx
│   ├── PrivacySettings.tsx
│   ├── ProfileHeader.tsx
│   ├── ProfileStats.tsx
│   └── SkillProgress.tsx
├── referrals/                   # Referral system
│   └── referral-dashboard.tsx
├── shared/                      # Reusable components
│   ├── FollowButton.tsx
│   ├── FollowListModal.tsx
│   ├── FollowStats.tsx
│   ├── PostContent.tsx
│   └── UserLink.tsx
├── density-toggle.tsx           # UI density toggle
├── logger-initializer.tsx       # Logging setup
├── mission-card.tsx            # Mission display
├── missions-filters.tsx        # Mission filtering
├── test-upload-debug.tsx       # Upload debugging
└── theme-provider.tsx          # Theme context
```

### Contexts Directory (`/contexts`)

React Context providers for global state management.

```
contexts/
├── auth-context.tsx             # Authentication state
├── follow-context.tsx           # Follow relationships
├── session-cache-context.tsx    # API response caching
└── websocket-context.tsx        # WebSocket connection
```

### Hooks Directory (`/hooks`)

Custom React hooks for reusable logic.

```
hooks/
├── use-cached-user.ts           # User data caching
├── use-mobile.tsx               # Mobile detection
├── use-realtime-leaderboard.ts  # Live leaderboard updates
├── use-toast.ts                 # Toast notifications
└── use-view-tracker.ts          # Post view tracking
```

### Lib Directory (`/lib`)

Core utilities and configurations.

```
lib/
├── api-client.ts                # Centralized API client
├── auth-config.ts               # NextAuth configuration
├── auth.ts                      # Auth utilities
├── cloudinary-client.ts         # Cloudinary client-side
├── cloudinary-server.ts         # Cloudinary server-side
├── cloudinary.ts                # Cloudinary main config
├── db.ts                        # Database connection
├── logger.ts                    # Logging utilities
├── request-dedup.ts             # Request deduplication
├── utils.ts                     # General utilities
├── websocket-client.ts          # WebSocket client
├── websocket-server.ts          # WebSocket server
└── websocket.ts                 # WebSocket utilities
```

### Models Directory (`/models`)

MongoDB/Mongoose schema definitions.

```
models/
├── Activity.ts                  # User activity tracking
├── Block.ts                     # User blocking
├── ChallengeParticipation.ts    # Challenge participation
├── Comment.ts                   # Post comments
├── Conversation.ts              # Message conversations
├── Follow.ts                    # Follow relationships
├── Like.ts                      # Like system
├── Message.ts                   # Direct messages
├── Mission.ts                   # Gamification missions
├── MissionProgress.ts           # Mission progress tracking
├── Notification.ts              # User notifications
├── Post.ts                      # User posts
├── Referral.ts                  # Referral system
├── Report.ts                    # Content reports
├── Tag.ts                       # Hashtags
├── User.ts                      # User accounts
├── UserMention.ts               # User mentions
├── UserProfile.ts               # Extended user profiles
├── UserStats.ts                 # User statistics
├── View.ts                      # Post views
├── WeeklyChallenge.ts           # Weekly challenges
└── XPLog.ts                     # XP transaction log
```

### Utils Directory (`/utils`)

Business logic and utility functions.

```
utils/
├── avatar-generator.ts          # Avatar generation
├── awardXP.ts                   # XP awarding system
├── badge-system.ts              # Badge management
├── challenge-recommender.ts     # Challenge recommendations
├── challenge-system.ts          # Challenge logic
├── check-referral-middleware.ts # Referral checking
├── feed-algorithm.ts            # Feed ranking algorithm
├── formatDate.ts                # Date formatting
├── gamification-service.ts      # Gamification logic
├── logger.ts                    # Logging utilities
├── mention-utils.ts             # User mention handling
├── mission-tracker.ts           # Mission progress tracking
├── rank-system.ts               # User ranking system
├── referral-system.ts           # Referral logic
├── response.ts                  # API response formatting
├── sample-challenges.ts         # Sample challenge data
├── sample-missions.ts           # Sample mission data
├── tag-utils.ts                 # Hashtag utilities
├── uploadthing.ts               # File upload utilities
├── validation.ts                # Input validation schemas
└── xp-system.ts                 # XP calculation system
```

### Scripts Directory (`/scripts`)

Database and utility scripts.

```
scripts/
├── clear-session.js             # Clear user sessions
├── create-sample-posts.js       # Generate sample posts
├── create-test-user.js          # Create test users
├── fix-akdavid-follows.ts       # Fix follow relationships
├── fix-like-indexes.js          # Fix database indexes
├── migrate-branch-to-affiliation.js # Data migration
├── migrate-branch-to-affiliation.ts # TypeScript version
├── migrate-referral-codes.ts    # Referral code migration
├── reduce-logs.js               # Log cleanup
├── rollback-affiliation-to-branch.js # Rollback migration
├── seed-challenges.ts           # Seed challenge data
├── seed-database.ts             # Database seeding
├── seed-missions.ts             # Seed mission data
├── seed-tags.ts                 # Seed hashtag data
├── test-referral-flow.js        # Test referral system
└── test-referral-system.ts      # Referral system testing
```

### Documentation Directory (`/docs`)

Project documentation and guides.

```
docs/
├── documentation/               # Comprehensive documentation
│   ├── README.md               # Documentation hub
│   ├── api-documentation.md    # API reference
│   ├── user-guides.md          # User guides
│   ├── developer-guides.md     # Developer guides
│   ├── configuration-guides.md # Setup guides
│   ├── component-documentation.md # Component reference
│   ├── contributing-guidelines.md # Contribution guide
│   └── project-structure.md    # This file
├── affiliations.json           # University/company data
├── nigerian_universities.csv   # Nigerian universities
├── Techboot camps.pdf          # Bootcamp information
├── upload-integration-guide.md # Upload integration
└── xp-system-guide.md          # XP system documentation
```

### Public Directory (`/public`)

Static assets served directly.

```
public/
├── .well-known/                 # Well-known endpoints
│   └── appspecific/
│       └── com.chrome.devtools.json
├── placeholder-logo.png         # Logo placeholder
├── placeholder-logo.svg         # SVG logo
├── placeholder-user.jpg         # User avatar placeholder
├── placeholder.jpg              # General placeholder
└── placeholder.svg              # SVG placeholder
```

### Configuration Files

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "strict": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Tailwind Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

#### Next.js Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['uploadthing.com', 'res.cloudinary.com'],
  },
  // Additional configurations
}

module.exports = nextConfig
```

## File Naming Conventions

### Components
- **PascalCase** for component files: `UserProfile.tsx`
- **kebab-case** for utility components: `user-link.tsx`
- **Index files** for barrel exports: `index.ts`

### API Routes
- **kebab-case** for route segments: `forgot-password`
- **[brackets]** for dynamic routes: `[userId]`
- **route.ts** for route handlers

### Utilities and Hooks
- **kebab-case** for files: `use-cached-user.ts`
- **camelCase** for functions: `getUserProfile()`

### Constants and Types
- **UPPER_SNAKE_CASE** for constants: `XP_REWARDS`
- **PascalCase** for types/interfaces: `UserProfile`

## Import/Export Patterns

### Barrel Exports
```typescript
// components/ui/index.ts
export { Button } from './button'
export { Card } from './card'
export { Dialog } from './dialog'
```

### Absolute Imports
```typescript
// Use @ alias for absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getUserProfile } from '@/lib/api-client'
```

### Component Exports
```typescript
// Named export (preferred)
export const UserProfile: React.FC<UserProfileProps> = ({ ... }) => {
  // Component implementation
}

// Default export for pages
export default function ProfilePage() {
  // Page implementation
}
```

## Architecture Principles

### Separation of Concerns
- **Components**: UI rendering and user interaction
- **Contexts**: Global state management
- **Hooks**: Reusable stateful logic
- **Utils**: Pure business logic functions
- **Lib**: External service integrations

### Data Flow
```
User Interaction → Component → Hook → API Client → API Route → Database
                                ↓
                            Context (Global State)
                                ↓
                            Other Components
```

### Scalability Considerations
- **Feature-based organization** for large features
- **Shared components** for reusability
- **Centralized API client** for consistency
- **Type-safe interfaces** for reliability
- **Modular architecture** for maintainability

This project structure provides a solid foundation for a scalable, maintainable Next.js application with clear separation of concerns and consistent organization patterns.