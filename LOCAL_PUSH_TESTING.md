# Local Push Notification Testing Guide

## Problem
Push notifications require HTTPS, but localhost runs on HTTP by default.

## Solution Options

### Option 1: Use Chrome's Localhost Exception (Easiest)
Chrome allows push notifications on `localhost` without HTTPS.

1. **Close ALL Chrome windows completely**
2. **Open Chrome with flag**:
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://localhost:3000" --user-data-dir=C:\chrome-dev-profile

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure="http://localhost:3000" --user-data-dir=/tmp/chrome-dev-profile

# Linux
google-chrome --unsafely-treat-insecure-origin-as-secure="http://localhost:3000" --user-data-dir=/tmp/chrome-dev-profile
```

3. **Go to** `http://localhost:3000/test-push`
4. **Click** "Subscribe to Push Notifications"
5. **Accept** browser permission

### Option 2: Use ngrok (Recommended for Testing)
ngrok creates an HTTPS tunnel to your localhost.

1. **Install ngrok**:
```bash
# Windows (with Chocolatey)
choco install ngrok

# Or download from: https://ngrok.com/download
```

2. **Start your dev server**:
```bash
pnpm dev
```

3. **In another terminal, start ngrok**:
```bash
ngrok http 3000
```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update `.env.local`**:
```env
NEXTAUTH_URL=https://abc123.ngrok.io
NEXT_PUBLIC_API_BASE_URL=https://abc123.ngrok.io/api
```

6. **Restart dev server**

7. **Open** `https://abc123.ngrok.io/test-push`

8. **Subscribe** to push notifications

### Option 3: Self-Signed SSL Certificate
Create a local HTTPS server.

1. **Install mkcert**:
```bash
# Windows (with Chocolatey)
choco install mkcert

# Mac
brew install mkcert
```

2. **Create certificate**:
```bash
mkcert -install
mkcert localhost
```

3. **Update `package.json`**:
```json
{
  "scripts": {
    "dev": "next dev --experimental-https --experimental-https-key ./localhost-key.pem --experimental-https-cert ./localhost.pem"
  }
}
```

4. **Start server**: `pnpm dev`

5. **Open** `https://localhost:3000/test-push`

### Option 4: Skip Push Notifications for Local Testing
Test the XP overtake system without push notifications.

1. **Run XP overtake test**:
```bash
pnpm tsx scripts/test-xp-overtake.ts
```

This tests:
- ✅ Overtake detection
- ✅ In-app notifications
- ❌ Push notifications (skipped)

2. **Test push notifications on production** after deployment

## Recommended Workflow

### For Development:
1. Use **Option 4** - Test XP overtakes without push
2. Verify in-app notifications work
3. Deploy to Vercel for push notification testing

### For Full Testing:
1. Use **Option 2 (ngrok)** - Easy HTTPS tunnel
2. Test complete flow including push notifications

## Quick Test Commands

### Test XP Overtakes (No Push Required):
```bash
pnpm tsx scripts/test-xp-overtake.ts
```

### Test Push Notifications (Requires HTTPS):
```bash
pnpm tsx scripts/test-push-notification.ts
```

## Production Deployment
Push notifications will work automatically on Vercel (HTTPS by default):

1. **Deploy to Vercel**:
```bash
git push
```

2. **Add environment variables** in Vercel dashboard

3. **Test on production URL**

## Verification Checklist

- [ ] XP overtake detection works (run test script)
- [ ] In-app notifications created
- [ ] Service worker registered
- [ ] VAPID keys configured
- [ ] Push notifications work (on HTTPS)

## Current Status
✅ System is fully implemented
✅ XP overtakes can be tested locally
⚠️ Push notifications require HTTPS (use ngrok or deploy to test)
