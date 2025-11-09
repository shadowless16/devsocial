# Quick Setup Guide: XP Overtake Push Notifications

## Step 1: Install Dependencies
```bash
pnpm add web-push
```

## Step 2: Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BKxT...
Private Key: abc123...
```

## Step 3: Add Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKxT... (your public key)
VAPID_PRIVATE_KEY=abc123... (your private key)
VAPID_SUBJECT=mailto:your-email@devsocial.com
CRON_SECRET=generate_a_random_secure_string
```

## Step 4: Add Push Notification Prompt to Layout
Edit `app/(authenticated)/layout.tsx`:

```typescript
import { PushNotificationPrompt } from '@/components/notifications/push-notification-prompt'

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      {children}
      <PushNotificationPrompt />
    </>
  )
}
```

## Step 5: Test Locally

### 5.1 Start Development Server
```bash
pnpm dev
```

### 5.2 Enable Push Notifications
1. Open http://localhost:3000
2. Wait 5 seconds for prompt
3. Click "Enable"
4. Accept browser permission

### 5.3 Test Overtake Detection
```bash
# Run manual check
pnpm tsx scripts/check-xp-overtakes.ts

# Or via API
curl -X POST http://localhost:3000/api/xp-overtakes/check
```

## Step 6: Deploy to Vercel

### 6.1 Add Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables from Step 3

### 6.2 Deploy
```bash
git add .
git commit -m "Add XP overtake push notifications"
git push
```

### 6.3 Verify Cron Job
1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. You should see: `/api/cron/check-overtakes` running every 5 minutes

## How It Works

### Automatic Checks
- **After XP Gain**: Checks run automatically when users earn ≥10 XP
- **Scheduled**: Cron job runs every 5 minutes to catch any missed overtakes

### Notification Flow
1. User earns XP
2. System checks if they overtook anyone
3. Creates in-app notifications for both users
4. Sends push notifications if users are offline/subscribed

### Example Notifications
- **Overtaker**: "🔥 You just overtook @TemiDev in XP — keep it up!"
- **Overtaken**: "⚡ @TemiDev just overtook you in XP — time to level up!"

## Testing Scenarios

### Scenario 1: Basic Overtake
```bash
# Give User A 1000 XP
# Give User B 1010 XP
# User B should overtake User A
# Both receive notifications
```

### Scenario 2: Push Notification
```bash
# User subscribes to push notifications
# User closes browser/tab
# Another user overtakes them
# They receive browser push notification
```

### Scenario 3: Multiple Overtakes
```bash
# User jumps from rank 10 to rank 5
# All 5 overtaken users receive notifications
# Overtaker receives 5 notifications
```

## Troubleshooting

### "Push notifications not supported"
- Ensure you're using HTTPS (or localhost)
- Check browser compatibility
- Try Chrome/Edge/Firefox

### "Service worker registration failed"
- Check that `public/sw.js` exists
- Clear browser cache
- Check browser console for errors

### "No overtakes detected"
- Verify users have different XP amounts
- Check that snapshots are being saved
- Run manual check: `pnpm tsx scripts/check-xp-overtakes.ts`

### "Cron not running on Vercel"
- Verify `vercel.json` is in root directory
- Check Vercel dashboard for cron logs
- Ensure `CRON_SECRET` is set in Vercel environment variables

## Configuration Options

### Change Cron Frequency
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-overtakes",
      "schedule": "*/10 * * * *"  // Every 10 minutes
    }
  ]
}
```

### Change XP Threshold
Edit `utils/gamification-service.ts`:
```typescript
// Check for XP overtakes after significant XP gain
if (xpAwarded >= 20) {  // Change from 10 to 20
  XPOvertakeService.checkAndNotifyOvertakes('all-time')
}
```

### Disable Prompt Auto-Show
Edit `components/notifications/push-notification-prompt.tsx`:
```typescript
// Remove or comment out the setTimeout
// setTimeout(() => setShowPrompt(true), 5000)
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Generate VAPID keys
3. ✅ Add environment variables
4. ✅ Add prompt to layout
5. ✅ Test locally
6. ✅ Deploy to Vercel
7. 🎉 Users receive overtake notifications!

## Support

For detailed documentation, see: `docs/XP_OVERTAKE_NOTIFICATIONS.md`
