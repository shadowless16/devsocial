# Project Structure

```
├── .env
├── .gitignore
├── app
│   ├── (authenticated)
│   │   ├── challenges
│   │   │   └── page.tsx
│   │   ├── confess
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── leaderboard
│   │   │   └── page.tsx
│   │   ├── messages
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── missions
│   │   │   └── page.tsx
│   │   ├── moderation
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── post
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── profile
│   │   │   ├── page.tsx
│   │   │   └── [username]
│   │   │       └── page.tsx
│   │   ├── referrals
│   │   │   └── page.tsx
│   │   ├── search
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── settings
│   │   │   └── page.tsx
│   │   └── trending
│   │       └── page.tsx
│   ├── api
│   │   ├── analytics
│   │   │   └── route.ts
│   │   ├── auth
│   │   │   ├── forgot-password
│   │   │   │   └── route.ts
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   ├── refresh
│   │   │   │   └── route.ts
│   │   │   ├── reset-password
│   │   │   │   └── route.ts
│   │   │   ├── signup
│   │   │   │   └── route.ts
│   │   │   ├── verify-email
│   │   │   │   └── route.ts
│   │   │   └── [...nextauth]
│   │   │       └── route.ts
│   │   ├── challenges
│   │   │   ├── leaderboard
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   ├── user
│   │   │   │   └── route.ts
│   │   │   └── [challengeId]
│   │   │       ├── join
│   │   │       │   └── route.ts
│   │   │       └── submit
│   │   │           └── route.ts
│   │   ├── comments
│   │   │   ├── delete
│   │   │   │   └── [commentId]
│   │   │   │       └── route.ts
│   │   │   ├── route.ts
│   │   │   └── [postId]
│   │   │       └── route.ts
│   │   ├── dashboard
│   │   │   └── route.ts
│   │   ├── feed
│   │   │   └── route.ts
│   │   ├── gamification
│   │   │   └── award-xp
│   │   │       └── route.ts
│   │   ├── leaderboard
│   │   │   └── route.ts
│   │   ├── likes
│   │   │   ├── comments
│   │   │   │   └── [commentId]
│   │   │   │       └── route.ts
│   │   │   └── posts
│   │   │       └── [postId]
│   │   │           └── route.ts
│   │   ├── messages
│   │   │   ├── conversations
│   │   │   │   └── route.ts
│   │   │   └── [conversationId]
│   │   │       ├── route.ts
│   │   │       └── [messageId]
│   │   │           └── reactions
│   │   │               └── route.ts
│   │   ├── mod
│   │   │   └── reports
│   │   │       ├── route.ts
│   │   │       └── [id]
│   │   │           └── status
│   │   │               └── route.ts
│   │   ├── notifications
│   │   │   ├── mark-all-read
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── posts
│   │   │   ├── route.ts
│   │   │   └── [id]
│   │   │       └── route.ts
│   │   ├── referrals
│   │   │   ├── create
│   │   │   │   └── route.ts
│   │   │   └── stats
│   │   │       └── route.ts
│   │   ├── reports
│   │   │   └── route.ts
│   │   ├── search
│   │   │   ├── advanced
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── trending
│   │   │   └── route.ts
│   │   └── users
│   │       ├── block
│   │       │   └── [userId]
│   │       │       └── route.ts
│   │       ├── follow
│   │       │   └── [userId]
│   │       │       └── route.ts
│   │       ├── profile
│   │       │   └── route.ts
│   │       └── [username]
│   │           └── route.ts
│   ├── auth
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── signup
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── onboarding
│       └── page.tsx
├── components
│   ├── challenges
│   │   └── weekly-challenges.tsx
│   ├── feed
│   │   ├── comment-item.tsx
│   │   ├── Feed.tsx
│   │   └── FeedItem.tsx
│   ├── gamification
│   │   ├── rank-display.tsx
│   │   ├── xp-bar.tsx
│   │   └── xp-notification.tsx
│   ├── layout
│   │   ├── nav-sidebar.tsx
│   │   └── right-sidebar.tsx
│   ├── leaderboard
│   │   └── enhanced-leaderboard.tsx
│   ├── modals
│   │   └── post-modal.tsx
│   ├── notifications
│   │   └── notification-center.tsx
│   ├── onboarding
│   │   ├── avatar-setup.tsx
│   │   ├── interest-tags.tsx
│   │   ├── starter-badge.tsx
│   │   └── welcome-gamification.tsx
│   ├── profile
│   │   └── badge-item.tsx
│   ├── referrals
│   │   └── referral-dashboard.tsx
│   └── theme-provider.tsx
├── components.json
├── contexts
│   ├── auth-context.tsx
│   └── websocket-context.tsx
├── hooks
│   ├── use-mobile.tsx
│   ├── use-realtime-leaderboard.ts
│   └── use-toast.ts
├── lib
│   ├── api-client.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   ├── websocket-client.ts
│   └── websocket.ts
├── middleware
│   ├── auth-middleware.ts
│   └── auth.ts
├── models
│   ├── Activity.ts
│   ├── Block.ts
│   ├── ChallengeParticipation.ts
│   ├── Comment.ts
│   ├── Conversation.ts
│   ├── Follow.ts
│   ├── Like.ts
│   ├── Message.ts
│   ├── Notification.ts
│   ├── Post.ts
│   ├── Referral.ts
│   ├── Report.ts
│   ├── User.ts
│   ├── UserStats.ts
│   ├── WeeklyChallenge.ts
│   └── XPLog.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── project_files.js
├── PROJECT_STRUCTURE.md
├── public
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── scripts
│   └── seed-database.ts
├── styles
│   └── globals.css
├── tailwind.config.ts
├── tsconfig.json
├── types
│   └── global.d.ts
└── utils
    ├── awardXP.ts
    ├── badge-system.ts
    ├── challenge-system.ts
    ├── feed-algorithm.ts
    ├── gamification-service.ts
    ├── rank-system.ts
    ├── referral-system.ts
    ├── response.ts
    ├── validation.ts
    └── xp-system.ts

```
