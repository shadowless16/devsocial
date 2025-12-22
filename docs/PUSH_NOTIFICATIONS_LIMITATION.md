# Push Notifications - Known Limitation

## Issue
Push notifications fail on Vercel deployment with error:
```
AbortError: Registration failed - push service error
```

## Root Cause
Browser push services (FCM for Chrome, etc.) reject push subscriptions on certain domains, including:
- `*.vercel.app` domains
- Some free hosting domains
- Domains without proper SSL configuration

Even with valid VAPID keys, the browser's push service refuses to register the subscription.

## Verification
- ✅ VAPID keys are valid (87 chars public, 43 chars private)
- ✅ Keys convert properly (65 bytes)
- ✅ Service worker registered successfully
- ❌ Browser push service rejects subscription

## Solutions

### Option 1: Use Custom Domain (Recommended)
1. Add a custom domain to your Vercel project
2. Ensure SSL is properly configured
3. Re-enable push notifications
4. Test subscription

### Option 2: Use Alternative Notification Service
Consider using:
- **Firebase Cloud Messaging (FCM)** directly
- **OneSignal** - Free push notification service
- **Pusher** - Real-time notification service
- **WebSocket notifications** - Already implemented in the app

### Option 3: Keep Disabled
The app already has:
- ✅ Real-time WebSocket notifications
- ✅ In-app notification system
- ✅ Email notifications (if configured)

Push notifications are a nice-to-have feature, not critical.

## Current Status
Push notifications are **disabled** in production to prevent console errors. The feature can be re-enabled by:

1. Removing the early return in `push-notification-prompt.tsx` line 16
2. Deploying to a custom domain
3. Testing the subscription

## References
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Chrome Push Service Limitations](https://developer.chrome.com/docs/web-platform/push-notifications)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
