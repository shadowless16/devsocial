# Cloudflare Worker Push Notification Setup

## Why Cloudflare Workers?

Browser push services (Chrome FCM) reject `*.vercel.app` domains. Using Cloudflare Workers as a stable origin solves this completely.

## Setup Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespace

```bash
cd cloudflare-worker
wrangler kv:namespace create "PUSH_SUBSCRIPTIONS"
```

Copy the `id` from output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "PUSH_SUBSCRIPTIONS"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

### 3. Add VAPID Keys as Secrets

Use the keys you generated earlier:

```bash
wrangler secret put VAPID_PUBLIC_KEY
# Paste: BPnh4rjkBCAar-Dsf8AuktKP8cIODOphJsvTa05QPWTX2ti7TALPhNN0119PqqGsKw9tDh0lJehqHFEiX5m8Hi4

wrangler secret put VAPID_PRIVATE_KEY
# Paste: ufMbb32K2sI-bXS4r7cVJiRDwd2z0ilMF1EfkqGAk04
```

### 4. Install Dependencies

```bash
cd cloudflare-worker
npm install
```

### 5. Test Locally

```bash
npm run dev
```

Visit: http://localhost:8787

### 6. Deploy to Cloudflare

```bash
npm run deploy
```

You'll get a URL like: `https://devsocial-push.YOUR_SUBDOMAIN.workers.dev`

### 7. Update Next.js Environment Variables

Add to `.env.local` and Vercel:

```env
NEXT_PUBLIC_WORKER_URL=https://devsocial-push.YOUR_SUBDOMAIN.workers.dev
```

Or use your existing worker:

```env
NEXT_PUBLIC_WORKER_URL=https://vite-react-template.akdavid4real.workers.dev
```

### 8. Deploy Next.js App

```bash
git add -A
git commit -m "feat: integrate Cloudflare Worker for push notifications"
git push
```

## API Endpoints

### Subscribe
```bash
POST /api/push/subscribe
Body: PushSubscription object
```

### Send to User
```bash
POST /api/push/send
Body: {
  "userId": "user123",
  "title": "Hello!",
  "body": "You have a new notification",
  "data": {}
}
```

### Broadcast to All
```bash
POST /api/push/broadcast
Body: {
  "title": "Announcement",
  "body": "New feature released!",
  "data": {}
}
```

## Testing

```bash
# Subscribe (from browser console after enabling notifications)
# Then test sending:

curl -X POST https://YOUR_WORKER.workers.dev/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "anonymous",
    "title": "Test Notification",
    "body": "Push notifications working!"
  }'
```

## Troubleshooting

### Worker not deploying?
- Check `wrangler.toml` has correct KV namespace ID
- Ensure secrets are set: `wrangler secret list`

### Still getting errors?
- Clear browser cache and service workers
- Check browser console for detailed errors
- Verify VAPID keys match between Worker and Next.js

### No notifications received?
- Check notification permissions in browser
- Verify service worker is registered
- Check Worker logs: `wrangler tail`

## Architecture

```
Browser
  ↓ (registers service worker from Vercel)
  ↓ (subscribes to push via Cloudflare Worker)
  ↓
Cloudflare Worker (stable origin)
  ↓ (stores subscription in KV)
  ↓ (sends push via Web Push protocol)
  ↓
Browser Push Service (FCM/etc)
  ↓
User receives notification
```

## Benefits

✅ Stable `*.workers.dev` origin trusted by browsers
✅ No Firebase/FCM setup needed
✅ Pure Web Push protocol
✅ Works with Vercel deployment
✅ Free tier: 100k requests/day
