## DevSocial — Copilot instructions (concise)

Goal: help an AI coding agent become productive quickly in this repo by documenting the project's architecture, key workflows, conventions, integration points, and concrete code examples.

1) Big-picture architecture
- Frontend: Next.js 14 (app/ directory). Pages and routing live under `app/` — authenticated pages are under `app/(authenticated)/`.
- API: Server routes under `app/api/*` — these are Next.js route handlers (e.g., `app/api/posts/route.ts`, `app/api/notifications/route.ts`).
- Data layer: Mongoose models live under `models/` (e.g., `models/Post.ts`, `models/Notification.ts`, `models/User.ts`). API routes directly import and use these models.
- State & real-time: React Contexts in `contexts/` (notably `notification-context.tsx`, `auth-context.tsx`, `websocket-context.tsx`) manage client state and socket.io connections.

2) Critical dev workflows & commands
- Local dev: `pnpm install` then `pnpm run dev` (uses Next dev server). See `package.json` for other scripts.
- Build: `pnpm run build` and `pnpm start` for production. Use `pnpm run build:fast` if needed.
- Lint: `pnpm run lint`. Tests: `pnpm test` (Jest) and several test scripts are available (see `package.json`).
- Environment: copy `.env.example` to `.env.local`; required keys include `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

3) Project-specific conventions & patterns
- Two profile flows: public profile (app/(authenticated)/profile/[username]/page.tsx) fetches `GET /api/users/:username` which returns `recentPosts`; the signed-in user's profile (app/(authenticated)/profile/page.tsx) fetches `GET /api/profile/activity` which reads from `Activity` model. When adding posts, ensure either an `Activity` record is created or the profile activity endpoint includes Post fallback.
- Notification pattern: server creates Notification model entries and socket.io emits `new_notification` rooms named `user:{id}` in `lib/websocket.ts`. The client periodically refreshes unread count by hitting `/api/notifications?unread=true&limit=1` — do not rely on the result array length; always compute unread count via DB count on the server side (see `app/api/notifications/route.ts`).
- Context usage: `contexts/notification-context.tsx` exposes `useNotifications()` with methods: `fetchNotifications`, `markAsRead`, `markAllAsRead`, `refreshUnreadCount`. Many components (e.g., `components/layout/side-nav.tsx`) read `unreadCount` and render badges.
- UI components: `components/ui/` contains shared shadcn-style components. Keep accessibility and Tailwind utility classes consistent with existing conventions (small text sizes, badge styles, etc.).

4) Integration points & external dependencies
- Authentication: NextAuth.js integrated with server sessions via `getServerSession(authOptions)` used in API routes.
- Database: MongoDB + Mongoose; connection helper in `lib/db.ts`.
- Websockets: socket.io server helper in `lib/websocket.ts`, emits to `user:${id}` rooms and saves Notification documents.
- File uploads: UploadThing / Cloudinary integrations appear in API routes (search for `/api/upload`).

5) Common pitfalls / gotchas (observed patterns)
- Activity vs Post source: profile activity reads from `Activity` model while feed reads from `Post` model. When implementing new post creation flows, create the Post and an Activity entry (type `post_creation`) to keep both feeds consistent.
- Notification unread-count bug: do not count unread by returning a limited list; compute unread count with `Notification.countDocuments({ recipient, read: false })`.
- Client optimistic updates: components dispatch Custom Events like `post:created` to update feeds; search for `window.dispatchEvent(new CustomEvent('post:created'`).
- Server routes expect session-based IDs: many APIs use `session.user.id`. When writing tests or scripts, mock NextAuth server session or call APIs with a proper cookie/session.

6) Where to look for examples
- Post creation & feed: `app/api/posts/route.ts`, `components/feed/feed.tsx`, `components/shared/postcontent.tsx`.
- Notifications: server socket+save flow: `lib/websocket.ts`; client context & UI: `contexts/notification-context.tsx`, `components/notifications/notification-bell.tsx`, `components/notifications/notification-list.tsx`.
- Profiles: public profile: `app/(authenticated)/profile/[username]/page.tsx`; own profile: `app/(authenticated)/profile/page.tsx`; user API: `app/api/users/[username]/route.ts`.
- Sidebar & badges: `components/layout/side-nav.tsx` shows how badges and unread counts are rendered.

7) Recommended tasks for AI agents (first-pass)
- When changing post creation flows, update `app/api/posts/route.ts` to also insert an `Activity` model entry (type `post_creation`) and emit socket events consistent with `lib/websocket.ts`.
- When modifying notification endpoints, ensure `unreadCount` is computed by `countDocuments` and that clients receive the shape `{ success: true, data: { notifications, unreadCount, hasMore } }`.
- Use existing contexts (e.g., `useNotifications()`) rather than fetching `/api/notifications` directly in components.

8) Quick code examples (copy-paste friendly)
- Count unread notifications on server (example):
  ```ts
  const unreadCount = await Notification.countDocuments({ recipient: session.user.id, read: false })
  ```
- Create Activity after saving a Post (example):
  ```ts
  // after post.save()
  await Activity.create({ user: post.author, type: 'post_creation', metadata: { postId: post._id, content: post.content }, xpEarned: 0 })
  ```

If any of these sections are unclear or you'd like more/less detail (for example, a step-by-step for adding an Activity in the post creation flow or a test for the notifications API), tell me which area to expand and I'll iterate.
