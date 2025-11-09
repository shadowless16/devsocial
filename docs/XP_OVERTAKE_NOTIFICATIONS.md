# XP Overtake Notifications System

## Overview
This system tracks leaderboard position changes and sends real-time notifications when users overtake each other in XP rankings, including push notifications for offline users.

## Features

### 1. Real-Time Overtake Detection
- Monitors XP changes after significant gains (≥10 XP)
- Compares current leaderboard positions with historical snapshots
- Identifies when users overtake others in rankings

### 2. Dual Notification System
- **In-App Notifications**: Instant notifications in the notification center
- **Push Notifications**: Browser push notifications for offline users

### 3. Notification Types
- `xp_overtake`: "🔥 You just overtook @username in XP — keep it up!"
- `xp_overtaken`: "⚡ @username just overtook you in XP — time to level up!"

## Architecture

### Models

#### LeaderboardSnapshot
Stores historical leaderboard positions for comparison:
```typescript
{
  userId: ObjectId,
  rank: Number,
  totalXP: Number,
  type: 'all-time' | 'weekly' | 'monthly',
  createdAt: Date
}
```

#### Notification (Extended)
Added new notification types:
- `xp_overtake`
- `xp_overtaken`

#### User (Extended)
Added `pushSubscription` field for web push notifications

### Services

#### XPOvertakeService
Located: `utils/xp-overtake-service.ts`

**Methods:**
- `checkAndNotifyOvertakes(type)`: Checks for overtakes and sends notifications
- `notifySpecificOvertake(overtakerId, overtakenId)`: Sends notification for specific overtake
- `getCurrentLeaderboard(type)`: Gets current leaderboard rankings
- `saveCurrentSnapshot(leaderboard, type)`: Saves snapshot for future comparison

### API Endpoints

#### POST/GET `/api/xp-overtakes/check`
Manually trigger overtake check
```bash
curl -X POST http://localhost:3000/api/xp-overtakes/check \
  -H "Content-Type: application/json" \
  -d '{"type": "all-time"}'
```

#### GET `/api/cron/check-overtakes`
Automated cron endpoint (runs every 5 minutes)
```bash
curl http://localhost:3000/api/cron/check-overtakes \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### POST `/api/notifications/subscribe`
Subscribe to push notifications
```bash
curl -X POST http://localhost:3000/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{"subscription": {...}}'
```

## Setup Instructions

### 1. Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### 2. Environment Variables
Add to `.env.local`:
```env
# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@devsocial.com

# Cron Security
CRON_SECRET=your_secure_random_string
```

### 3. Install Dependencies
```bash
pnpm add web-push
```

### 4. Deploy Service Worker
The service worker (`public/sw.js`) is automatically served at `/sw.js`

### 5. Configure Vercel Cron
The `vercel.json` file configures automatic checks every 5 minutes

## Usage

### Enable Push Notifications (User)
1. User sees prompt after 5 seconds on first visit
2. Click "Enable" to subscribe to push notifications
3. Browser requests permission
4. Subscription saved to user profile

### Manual Check (Admin)
```bash
# Run script manually
pnpm tsx scripts/check-xp-overtakes.ts

# Or via API
curl -X POST http://localhost:3000/api/xp-overtakes/check
```

### Automatic Checks
- Triggered after any XP gain ≥10 points
- Runs via cron every 5 minutes
- Compares current positions with last snapshot

## How It Works

### Flow Diagram
```
User Earns XP (≥10)
    ↓
GamificationService.awardXP()
    ↓
XPOvertakeService.checkAndNotifyOvertakes()
    ↓
Get Current Leaderboard
    ↓
Compare with Last Snapshot
    ↓
Detect Overtakes
    ↓
Create Notifications (Both Users)
    ↓
Send Push Notifications (If Subscribed)
    ↓
Save New Snapshot
```

### Example Scenario
1. **Initial State**: Alice (Rank 5, 1000 XP), Bob (Rank 6, 950 XP)
2. **Bob Earns 60 XP**: Bob now has 1010 XP
3. **System Detects**: Bob (1010 XP) > Alice (1000 XP)
4. **Notifications Sent**:
   - Bob: "🔥 You just overtook @Alice in XP — keep it up!"
   - Alice: "⚡ @Bob just overtook you in XP — time to level up!"
5. **Push Notifications**: Sent to both if they're offline

## Components

### PushNotificationPrompt
Located: `components/notifications/push-notification-prompt.tsx`

Displays a card prompting users to enable push notifications:
- Shows after 5 seconds on first visit
- Can be dismissed (saved to localStorage)
- Handles subscription flow

### usePushNotifications Hook
Located: `hooks/use-push-notifications.ts`

React hook for managing push notification state:
```typescript
const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()
```

## Testing

### Test Push Notifications
```bash
# Subscribe a user first, then test
curl -X POST http://localhost:3000/api/xp-overtakes/check
```

### Test Overtake Detection
1. Give User A 1000 XP
2. Give User B 1010 XP
3. Run overtake check
4. Verify both users receive notifications

### Manual Script
```bash
pnpm tsx scripts/check-xp-overtakes.ts
```

## Performance Considerations

- Snapshots cleaned up after 24 hours
- Checks limited to top 100 users
- Cron runs every 5 minutes (configurable)
- Push notifications are fire-and-forget (non-blocking)

## Browser Support

Push notifications supported in:
- Chrome/Edge 50+
- Firefox 44+
- Safari 16+ (macOS 13+)
- Opera 37+

## Security

- Cron endpoint protected with `CRON_SECRET`
- Push subscriptions stored securely per user
- VAPID keys kept in environment variables
- Service worker served from same origin

## Troubleshooting

### Push Notifications Not Working
1. Check VAPID keys are set correctly
2. Verify service worker is registered: `navigator.serviceWorker.ready`
3. Check browser console for errors
4. Ensure HTTPS (required for push notifications)

### Overtakes Not Detected
1. Verify snapshots are being saved: Check `LeaderboardSnapshot` collection
2. Check XP threshold (must be ≥10 XP gain)
3. Review logs in `XPOvertakeService`

### Cron Not Running
1. Verify `vercel.json` is deployed
2. Check Vercel dashboard for cron logs
3. Ensure `CRON_SECRET` matches in environment

## Future Enhancements

- [ ] Weekly/Monthly leaderboard overtake notifications
- [ ] Configurable notification preferences per user
- [ ] Overtake history/analytics
- [ ] Email notifications for major overtakes
- [ ] Notification batching to prevent spam
- [ ] Custom notification sounds
- [ ] Rich notification content with images

## Related Files

- `models/Notification.ts` - Notification schema
- `models/LeaderboardSnapshot.ts` - Snapshot schema
- `utils/xp-overtake-service.ts` - Core service
- `utils/gamification-service.ts` - XP award integration
- `lib/push-notification.ts` - Push notification helper
- `app/api/xp-overtakes/check/route.ts` - Manual check endpoint
- `app/api/cron/check-overtakes/route.ts` - Cron endpoint
- `public/sw.js` - Service worker
- `hooks/use-push-notifications.ts` - React hook
- `components/notifications/push-notification-prompt.tsx` - UI prompt
