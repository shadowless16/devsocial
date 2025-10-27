# PWA & Push Notifications Setup Guide

## ✅ PWA Status: READY TO INSTALL

Your PWA is configured and installable with:
- ✅ manifest.json
- ✅ Service Worker (sw.js)
- ✅ Icons (192x192, 512x512)
- ✅ Offline page
- ✅ Auto-registration

## 🔔 Push Notifications Setup

### 1. Generate VAPID Keys

Run this command to generate keys:

```bash
npx web-push generate-vapid-keys
```

### 2. Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@devsocial.com
```

### 3. Update User Model

Add to `models/User.ts`:

```typescript
pushSubscription: {
  type: Object,
  required: false
}
```

### 4. Add Notification Component

In your authenticated layout or navbar, add:

```tsx
import PushNotificationManager from '@/components/push-notification-manager'

// In your component:
<PushNotificationManager />
```

### 5. Send Push Notifications

When creating notifications, send push:

```typescript
import { sendPushNotification } from '@/lib/push-notification'

// After creating notification in DB:
const user = await User.findById(recipientId)
if (user.pushSubscription) {
  await sendPushNotification(user.pushSubscription, {
    title: 'New Notification',
    body: 'You have a new notification',
    url: '/notifications',
    icon: '/icon-192x192.png'
  })
}
```

## 📱 Testing

### Desktop (Chrome/Edge):
1. Open DevTools > Application > Service Workers
2. Check "Update on reload"
3. Reload page
4. Click install prompt or use browser menu

### Mobile:
1. Open in Chrome/Safari
2. Tap "Add to Home Screen"
3. App installs like native app

### Push Notifications:
1. Click "Enable Notifications" button
2. Allow browser permission
3. Test by creating a notification in your app

## 🚀 Production Checklist

- [ ] Generate VAPID keys
- [ ] Add env variables to Vercel
- [ ] Update User model with pushSubscription field
- [ ] Add PushNotificationManager to layout
- [ ] Update notification creation to send push
- [ ] Test on mobile device
- [ ] Verify HTTPS (required for PWA)

## 📝 Files Created

- `/public/sw.js` - Enhanced service worker with push support
- `/app/api/notifications/subscribe/route.ts` - Subscribe endpoint
- `/app/api/notifications/unsubscribe/route.ts` - Unsubscribe endpoint
- `/components/push-notification-manager.tsx` - UI component
- `/lib/push-notification.ts` - Push utility function
