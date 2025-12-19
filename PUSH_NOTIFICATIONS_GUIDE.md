# 🔔 Push Notification System - Complete Guide

## Overview
DevSocial now has a **fully functional Instagram-style push notification system** that sends browser notifications even when users are not actively on the site.

## How It Works

### 1. Service Worker Registration
- Located at `/public/sw.js`
- Automatically registered when users visit the site
- Handles push notifications in the background
- Works even when the browser tab is closed

### 2. User Subscription Flow
1. User visits the site
2. After 5 seconds, a prompt appears asking to enable notifications
3. User clicks "Enable" → Browser asks for permission
4. Once granted, subscription is saved to the database
5. User can now receive push notifications anytime

### 3. Notification Triggers

Push notifications are automatically sent for:

#### ❤️ Likes
- When someone likes your post
- **Notification**: "❤️ New Like - [Username] liked your post"

#### 💬 Comments
- When someone comments on your post
- **Notification**: "💬 New Comment - [Username]: [Comment preview]"

#### 👤 Follows
- When someone follows you
- **Notification**: "👤 New Follower - [Username] started following you"

#### 📢 Mentions
- When someone mentions you in a post
- **Notification**: "📢 You were mentioned - [Username] mentioned you in a post"

#### 🏆 XP Overtakes
- When someone overtakes you on the leaderboard
- **Notification**: "🏆 You've been overtaken! - [Username] just passed you by [X] XP"

#### 🎉 XP Achievements
- When you overtake someone
- **Notification**: "🎉 You overtook someone! - You just overtook [Username] on the leaderboard"

#### 💬 Messages (Coming Soon)
- When someone sends you a message
- **Notification**: "💬 New Message - [Username]: [Message preview]"

## Technical Implementation

### Files Structure
```
lib/notifications/
├── push-service.ts              # Core push notification service
├── notification-helper.ts       # Helper functions for creating notifications
└── push-notification.ts         # Legacy push notification utility

components/notifications/
└── push-notification-prompt.tsx # UI prompt for enabling notifications

hooks/
└── use-push-notifications.ts    # React hook for managing subscriptions

public/
└── sw.js                        # Service worker for background notifications

app/api/notifications/
├── subscribe/route.ts           # Save push subscription
└── unsubscribe/route.ts         # Remove push subscription
```

### Database Schema
```typescript
// User model includes:
pushSubscription?: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
```

### API Integration

#### Sending Push Notifications
```typescript
import { sendPushToUser } from '@/lib/notifications/push-service'

// Send to single user
await sendPushToUser(userId, {
  title: 'New Notification',
  body: 'You have a new update',
  url: '/notifications',
  icon: '/icon-192x192.png',
  tag: 'notification'
})

// Send to multiple users
import { sendPushToMultipleUsers } from '@/lib/notifications/push-service'

await sendPushToMultipleUsers([userId1, userId2], {
  title: 'Announcement',
  body: 'Check out our new feature!',
  url: '/features'
})
```

#### Using Notification Helpers
```typescript
import { 
  notifyLike,
  notifyComment,
  notifyFollow,
  notifyMention,
  notifyXPOvertake
} from '@/lib/notifications/notification-helper'

// Automatically creates DB notification + sends push
await notifyLike(recipientId, senderId, postId, senderUsername)
await notifyComment(recipientId, senderId, postId, senderUsername, commentText)
await notifyFollow(recipientId, senderId, senderUsername)
```

## Environment Variables

Required in `.env.local`:
```env
# Push Notifications (Already configured)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKc6T2izuV44D-HV_Fr4MAJ-wDK4CLtQUyfn96H-EQ7nnxi2qScDafgLfSwm8IMAttyfc1rcRwe-eMgwcq6l9vg
VAPID_PRIVATE_KEY=e2zTjZ8W3e0S1iA9xDhOYG1llLG9pwsBgTbyGmkk4Gw
VAPID_SUBJECT=mailto:youremail@gmail.com
```

## User Experience

### First Time Users
1. Visit site → See prompt after 5 seconds
2. Click "Enable" → Browser permission dialog
3. Allow → Subscribed ✅
4. Start receiving notifications

### Returning Users
- If already subscribed → No prompt shown
- If dismissed → Can enable later in settings
- If blocked → Must enable in browser settings

### Notification Behavior
- **Tab Open**: Shows as browser notification + in-app notification
- **Tab Closed**: Shows as browser notification only
- **Browser Closed**: Still receives notifications (if browser supports)
- **Mobile**: Works on Chrome/Firefox/Edge mobile browsers

## Testing Push Notifications

### Manual Test
```bash
# In browser console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test Notification', {
    body: 'This is a test',
    icon: '/icon-192x192.png'
  })
})
```

### API Test
Create a test endpoint or use existing notification triggers:
1. Like a post → Check if notification appears
2. Comment on a post → Check notification
3. Follow a user → Check notification

## Browser Support

✅ **Supported**:
- Chrome (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Edge (Desktop & Mobile)
- Opera (Desktop & Mobile)
- Samsung Internet

❌ **Not Supported**:
- Safari (iOS) - Apple doesn't support Web Push API
- Safari (macOS) - Limited support, requires user interaction

## Privacy & Permissions

### User Control
- Users can disable notifications anytime
- Subscriptions are stored securely
- No personal data sent with notifications
- Users can revoke permission in browser settings

### Data Storage
- Push subscriptions stored in User model
- Encrypted endpoint URLs
- Automatic cleanup of expired subscriptions

## Troubleshooting

### Notifications Not Showing
1. Check browser permissions (Settings → Site Settings → Notifications)
2. Verify service worker is registered (DevTools → Application → Service Workers)
3. Check console for errors
4. Ensure VAPID keys are configured

### Subscription Failed
1. Check if HTTPS is enabled (required for service workers)
2. Verify VAPID keys are correct
3. Check browser console for errors
4. Try clearing service worker cache

### Push Not Received
1. Verify user has valid subscription in database
2. Check server logs for push errors
3. Ensure notification payload is valid JSON
4. Check if subscription expired (410 error)

## Future Enhancements

### Planned Features
- [ ] Notification preferences (choose which types to receive)
- [ ] Quiet hours (don't disturb mode)
- [ ] Notification grouping (combine similar notifications)
- [ ] Rich notifications (images, actions)
- [ ] Sound customization
- [ ] Desktop app integration

### Advanced Features
- [ ] Push notification analytics
- [ ] A/B testing for notification content
- [ ] Scheduled notifications
- [ ] Geolocation-based notifications
- [ ] Multi-device sync

## Best Practices

### When to Send Notifications
✅ **Do**:
- Important user interactions (likes, comments, follows)
- Time-sensitive updates (XP overtakes)
- Direct messages
- Mentions

❌ **Don't**:
- Spam users with too many notifications
- Send marketing messages without consent
- Notify for every minor action
- Send at inappropriate times

### Notification Content
✅ **Good**:
- Clear, concise titles
- Actionable messages
- Relevant context
- Proper emojis for visual appeal

❌ **Bad**:
- Vague messages
- Too long text
- Misleading content
- Excessive emojis

## Monitoring & Analytics

### Key Metrics to Track
- Subscription rate (% of users who enable)
- Click-through rate (% who click notifications)
- Unsubscribe rate
- Delivery success rate
- Error rate (expired subscriptions)

### Logging
All push notification attempts are logged:
- Success/failure status
- User ID
- Notification type
- Timestamp
- Error details (if failed)

## Security Considerations

### VAPID Keys
- Keep private key secret
- Never expose in client-side code
- Rotate keys periodically
- Use environment variables

### Subscription Validation
- Verify subscription format before saving
- Validate endpoint URLs
- Check for expired subscriptions
- Clean up invalid subscriptions

### Content Security
- Sanitize notification content
- Prevent XSS in notification messages
- Validate URLs before sending
- Rate limit notification sending

## Conclusion

The push notification system is now **fully operational** and provides:
- ✅ Real-time notifications even when site is closed
- ✅ Instagram-style user experience
- ✅ Automatic notifications for all key actions
- ✅ Easy to extend for new notification types
- ✅ Production-ready and scalable

Users will now stay engaged with DevSocial through timely, relevant notifications that bring them back to the platform!
