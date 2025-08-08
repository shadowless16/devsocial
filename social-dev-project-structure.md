# Project Structure

```
├── .env
├── .env.local
├── .gitignore
├── app
│   ├── (authenticated)
│   │   ├── challenges
│   │   │   └── page.tsx
│   │   ├── confess
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── home
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
│   │   │       ├── page-fixed.tsx
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
│   │   ├── affiliations
│   │   │   └── route.ts
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
│   │   ├── cron
│   │   │   └── check-referrals
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
│   │   │   ├── check-all
│   │   │   │   └── route.ts
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
│   │   ├── test-db
│   │   │   └── route.ts
│   │   ├── trending
│   │   │   └── route.ts
│   │   ├── upload
│   │   │   ├── avatar
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── uploadthing
│   │   │   ├── core.ts
│   │   │   └── route.ts
│   │   ├── users
│   │   │   ├── block
│   │   │   │   └── [userId]
│   │   │   │       └── route.ts
│   │   │   ├── follow
│   │   │   │   └── [userId]
│   │   │   │       └── route.ts
│   │   │   ├── id
│   │   │   │   └── [id]
│   │   │   ├── onboarding
│   │   │   │   └── route.ts
│   │   │   ├── profile
│   │   │   │   └── route.ts
│   │   │   ├── username
│   │   │   │   └── [username]
│   │   │   └── [username]
│   │   │       ├── followers
│   │   │       │   └── route.ts
│   │   │       ├── following
│   │   │       │   └── route.ts
│   │   │       └── route.ts
│   │   └── well-known
│   │       └── route.ts
│   ├── auth
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── signup
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── onboarding
│   │   └── page.tsx
│   ├── page.tsx
│   └── test-upload
│       └── page.tsx
├── CHANGELOG.md
├── components
│   ├── auth
│   │   └── auth-wrapper.tsx
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
│   ├── logger-initializer.tsx
│   ├── modals
│   │   ├── enhanced-post-modal.tsx
│   │   └── post-modal.tsx
│   ├── notifications
│   │   └── notification-center.tsx
│   ├── onboarding
│   │   ├── avatar-setup.tsx
│   │   ├── interest-tags.tsx
│   │   ├── starter-badge.tsx
│   │   ├── tech-profile.tsx
│   │   └── welcome-gamification.tsx
│   ├── profile
│   │   └── badge-item.tsx
│   ├── referrals
│   │   └── referral-dashboard.tsx
│   ├── shared
│   │   ├── FollowButton.tsx
│   │   ├── FollowListModal.tsx
│   │   ├── PostContent.tsx
│   │   └── UserLink.tsx
│   ├── test-upload-debug.tsx
│   └── theme-provider.tsx
├── components.json
├── contexts
│   ├── auth-context.tsx
│   ├── session-cache-context.tsx
│   └── websocket-context.tsx
├── docs
│   ├── affiliations.json
│   ├── nigerian_universities.csv
│   ├── Techboot camps.pdf
│   ├── upload-integration-guide.md
│   └── xp-system-guide.md
├── hooks
│   ├── use-cached-user.ts
│   ├── use-mobile.tsx
│   ├── use-realtime-leaderboard.ts
│   └── use-toast.ts
├── INVESTOR_OVERVIEW.md
├── jest.config.js
├── jest.setup.js
├── lib
│   ├── api-client.ts
│   ├── auth-config.ts
│   ├── auth.ts
│   ├── cloudinary-client.ts
│   ├── cloudinary-server.ts
│   ├── cloudinary.ts
│   ├── db.ts
│   ├── request-dedup.ts
│   ├── utils.ts
│   ├── websocket-client.ts
│   └── websocket.ts
├── load_affiliations.js
├── load_affiliations_atlas.js
├── middleware
│   ├── auth-middleware.ts
│   ├── auth.ts
│   └── rate-limit.ts
├── middleware.ts
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
├── next.config.js
├── next.config.mjs
├── ngrok.exe
├── openapi.yaml
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── project_files.js
├── PROJECT_STRUCTURE.md
├── public
│   ├── .well-known
│   │   └── appspecific
│   │       └── com.chrome.devtools.json
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── README.md
├── REFERRAL_TESTING_GUIDE.md
├── scripts
│   ├── clear-session.js
│   ├── create-sample-posts.js
│   ├── create-test-user.js
│   ├── fix-like-indexes.js
│   ├── migrate-branch-to-affiliation.js
│   ├── migrate-branch-to-affiliation.ts
│   ├── migrate-referral-codes.ts
│   ├── rollback-affiliation-to-branch.js
│   ├── seed-database.ts
│   └── test-referral-system.ts
├── social-dev-project-structure.md
├── styles
│   ├── globals.css
│   └── uploadthing.css
├── tailwind.config.ts
├── test-dashboard.js
├── test-uploadthing-config.js
├── tsconfig.json
├── types
│   └── global.d.ts
├── USER_PROFILE_NAVIGATION.md
└── utils
    ├── awardXP.ts
    ├── badge-system.ts
    ├── challenge-system.ts
    ├── check-referral-middleware.ts
    ├── feed-algorithm.ts
    ├── formatDate.ts
    ├── gamification-service.ts
    ├── logger.ts
    ├── rank-system.ts
    ├── referral-system.ts
    ├── response.ts
    ├── uploadthing.ts
    ├── validation.ts
    └── xp-system.ts

```
