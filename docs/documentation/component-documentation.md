# Component Documentation

UI component usage and props reference for DevSocial.

## Component Architecture

### Component Categories

```
components/
├── ui/                    # Base UI components (shadcn/ui)
├── feed/                  # Feed-related components
├── gamification/          # XP, badges, levels
├── layout/                # Layout components
├── auth/                  # Authentication components
├── profile/               # User profile components
├── shared/                # Reusable components
└── modals/                # Modal dialogs
```

## Base UI Components (shadcn/ui)

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

**Props:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}
```

### Card

Container component for grouping related content.

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog

Modal dialog component for overlays and forms.

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### Input

Form input component with validation support.

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

## Feed Components

### Feed

Main feed container that displays posts with infinite scrolling.

```tsx
import { Feed } from '@/components/feed/Feed'

<Feed
  type="all" // "all" | "following" | "trending"
  userId={currentUser?.id}
  onPostCreate={handlePostCreate}
/>
```

**Props:**
```typescript
interface FeedProps {
  type: 'all' | 'following' | 'trending'
  userId?: string
  onPostCreate?: (post: Post) => void
  className?: string
}
```

### FeedItem

Individual post component with like, comment, and share functionality.

```tsx
import { FeedItem } from '@/components/feed/FeedItem'

<FeedItem
  post={post}
  currentUserId={user?.id}
  onLike={handleLike}
  onComment={handleComment}
  onDelete={handleDelete}
  onShare={handleShare}
/>
```

**Props:**
```typescript
interface FeedItemProps {
  post: Post
  currentUserId?: string
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onDelete?: (postId: string) => void
  onShare?: (post: Post) => void
  showActions?: boolean
  className?: string
}

interface Post {
  id: string
  content: string
  author: {
    id: string
    username: string
    fullName: string
    avatar?: string
    level: number
  }
  tags: string[]
  media: string[]
  isAnonymous: boolean
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}
```

### CommentItem

Individual comment component with nested reply support.

```tsx
import { CommentItem } from '@/components/feed/comment-item'

<CommentItem
  comment={comment}
  currentUserId={user?.id}
  onLike={handleCommentLike}
  onReply={handleReply}
  onDelete={handleCommentDelete}
  depth={0}
/>
```

**Props:**
```typescript
interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onLike?: (commentId: string) => void
  onReply?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  depth?: number
  maxDepth?: number
}
```

## Gamification Components

### XPBar

Displays user's XP progress and level with animated progress bar.

```tsx
import { XPBar } from '@/components/gamification/xp-bar'

// Automatic - uses current user context
<XPBar />

// Manual - with specific user data
<XPBar
  currentXP={1250}
  level={5}
  xpForNextLevel={1500}
  showLevel={true}
  animated={true}
/>
```

**Props:**
```typescript
interface XPBarProps {
  currentXP?: number
  level?: number
  xpForNextLevel?: number
  showLevel?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### RankDisplay

Shows user's rank badge with level and title.

```tsx
import { RankDisplay } from '@/components/gamification/rank-display'

<RankDisplay
  level={12}
  xp={5420}
  size="lg"
  showXP={true}
  showTitle={true}
/>
```

**Props:**
```typescript
interface RankDisplayProps {
  level: number
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showXP?: boolean
  showTitle?: boolean
  className?: string
}
```

### XPNotification

Animated notification for XP gains.

```tsx
import { XPNotification } from '@/components/gamification/xp-notification'

<XPNotification
  xpGained={25}
  reason="Created a post"
  onComplete={() => setShowNotification(false)}
/>
```

**Props:**
```typescript
interface XPNotificationProps {
  xpGained: number
  reason: string
  onComplete?: () => void
  duration?: number
}
```

## Layout Components

### NavSidebar

Main navigation sidebar with menu items and user info.

```tsx
import { NavSidebar } from '@/components/layout/nav-sidebar'

<NavSidebar
  currentPath="/dashboard"
  onItemClick={handleNavClick}
  collapsed={isMobile}
/>
```

**Props:**
```typescript
interface NavSidebarProps {
  currentPath: string
  onItemClick?: (path: string) => void
  collapsed?: boolean
  className?: string
}
```

### RightSidebar

Right sidebar with trending content and suggestions.

```tsx
import { RightSidebar } from '@/components/layout/right-sidebar'

<RightSidebar
  showTrending={true}
  showSuggestions={true}
  showLeaderboard={true}
/>
```

**Props:**
```typescript
interface RightSidebarProps {
  showTrending?: boolean
  showSuggestions?: boolean
  showLeaderboard?: boolean
  className?: string
}
```

## Profile Components

### ProfileHeader

User profile header with avatar, stats, and follow button.

```tsx
import { ProfileHeader } from '@/components/profile/ProfileHeader'

<ProfileHeader
  user={profileUser}
  currentUserId={currentUser?.id}
  isOwnProfile={isOwnProfile}
  onFollow={handleFollow}
  onEdit={handleEdit}
/>
```

**Props:**
```typescript
interface ProfileHeaderProps {
  user: User
  currentUserId?: string
  isOwnProfile: boolean
  onFollow?: (userId: string) => void
  onEdit?: () => void
  className?: string
}
```

### ProfileStats

Displays user statistics in a grid layout.

```tsx
import { ProfileStats } from '@/components/profile/ProfileStats'

<ProfileStats
  stats={{
    postsCount: 42,
    followersCount: 128,
    followingCount: 95,
    xp: 2450,
    level: 8,
    badgesCount: 5
  }}
  onStatClick={handleStatClick}
/>
```

**Props:**
```typescript
interface ProfileStatsProps {
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
    xp: number
    level: number
    badgesCount: number
  }
  onStatClick?: (stat: string) => void
  layout?: 'grid' | 'horizontal'
  className?: string
}
```

### BadgeItem

Individual badge display component.

```tsx
import { BadgeItem } from '@/components/profile/badge-item'

<BadgeItem
  badge={{
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: '🚀',
    rarity: 'rare'
  }}
  size="md"
  showTooltip={true}
/>
```

**Props:**
```typescript
interface BadgeItemProps {
  badge: {
    id: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}
```

## Shared Components

### UserLink

Clickable user link with avatar and name.

```tsx
import { UserLink } from '@/components/shared/UserLink'

<UserLink
  user={{
    username: 'johndoe',
    fullName: 'John Doe',
    avatar: '/avatar.jpg',
    level: 5
  }}
  showAvatar={true}
  showLevel={true}
  size="sm"
/>
```

**Props:**
```typescript
interface UserLinkProps {
  user: {
    username: string
    fullName: string
    avatar?: string
    level?: number
  }
  showAvatar?: boolean
  showLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### FollowButton

Follow/unfollow button with loading states.

```tsx
import { FollowButton } from '@/components/shared/FollowButton'

<FollowButton
  userId="user123"
  isFollowing={false}
  onFollow={handleFollow}
  disabled={isLoading}
  size="sm"
/>
```

**Props:**
```typescript
interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  onFollow: (userId: string) => Promise<void>
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}
```

### PostContent

Renders post content with markdown support and media.

```tsx
import { PostContent } from '@/components/shared/PostContent'

<PostContent
  content="This is a **markdown** post with #hashtags and @mentions"
  media={['image1.jpg', 'image2.jpg']}
  onHashtagClick={handleHashtagClick}
  onMentionClick={handleMentionClick}
  onMediaClick={handleMediaClick}
/>
```

**Props:**
```typescript
interface PostContentProps {
  content: string
  media?: string[]
  onHashtagClick?: (hashtag: string) => void
  onMentionClick?: (username: string) => void
  onMediaClick?: (mediaUrl: string, index: number) => void
  maxLength?: number
  className?: string
}
```

## Modal Components

### PostModal

Modal for creating and editing posts.

```tsx
import { PostModal } from '@/components/modals/post-modal'

<PostModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handlePostSubmit}
  editPost={editingPost}
  defaultContent=""
  defaultTags={[]}
/>
```

**Props:**
```typescript
interface PostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (postData: CreatePostData) => Promise<void>
  editPost?: Post
  defaultContent?: string
  defaultTags?: string[]
}

interface CreatePostData {
  content: string
  tags: string[]
  media: string[]
  isAnonymous: boolean
}
```

## Custom Hooks Integration

### Using Components with Hooks

```tsx
import { useAuth } from '@/contexts/auth-context'
import { useWebSocket } from '@/contexts/websocket-context'
import { FeedItem } from '@/components/feed/FeedItem'

function MyFeedComponent() {
  const { user } = useAuth()
  const { socket } = useWebSocket()

  const handleLike = async (postId: string) => {
    // Like logic
    socket?.emit('post_liked', { postId, userId: user?.id })
  }

  return (
    <FeedItem
      post={post}
      currentUserId={user?.id}
      onLike={handleLike}
    />
  )
}
```

## Styling Guidelines

### Tailwind CSS Classes

```tsx
// Consistent spacing
<div className="space-y-4"> {/* Vertical spacing */}
<div className="space-x-2"> {/* Horizontal spacing */}

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">

// Interactive states
<button className="hover:bg-gray-100 active:bg-gray-200 transition-colors">
```

### Component Variants

```tsx
// Size variants
const sizeVariants = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg"
}

// Color variants
const colorVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  danger: "bg-red-600 hover:bg-red-700 text-white"
}
```

## Accessibility Features

### ARIA Labels and Roles

```tsx
<button
  aria-label="Like this post"
  aria-pressed={isLiked}
  role="button"
  onClick={handleLike}
>
  <Heart className={isLiked ? "fill-red-500" : ""} />
  <span className="sr-only">
    {isLiked ? "Unlike" : "Like"} this post
  </span>
</button>
```

### Keyboard Navigation

```tsx
<div
  tabIndex={0}
  role="button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Clickable content
</div>
```

## Performance Optimization

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Memoization

```tsx
import { memo, useMemo } from 'react'

const ExpensiveComponent = memo(({ data, filter }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => item.category === filter)
  }, [data, filter])

  return <div>{/* Render filtered data */}</div>
})
```

This component documentation provides comprehensive usage examples and prop references for all major components in the DevSocial platform.