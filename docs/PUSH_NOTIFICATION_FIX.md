# Push Notification VAPID Key Fix

## Problem
Push notification subscription fails with error:
```
AbortError: Registration failed - push service error
```

## Root Cause
The VAPID public key in `.env.local` is invalid or malformed. The push service rejects it.

## Solution

### Option 1: Generate New VAPID Keys (Recommended)

1. **Run the key generator:**
```bash
node scripts/generate-vapid-keys.js
```

2. **Copy the output keys to `.env.local`:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
VAPID_SUBJECT=mailto:your-email@example.com
```

3. **Restart your dev server:**
```bash
pnpm dev
```

### Option 2: Use web-push Library

1. **Install web-push:**
```bash
pnpm add -D web-push
```

2. **Generate keys:**
```bash
npx web-push generate-vapid-keys
```

3. **Update `.env.local` with the generated keys**

### Option 3: Disable Push Notifications Temporarily

If you don't need push notifications right now, you can disable the feature:

**In `.env.local`:**
```env
# Comment out or remove these lines:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
```

The app will gracefully handle missing keys and not show the push notification prompt.

## Verification

After updating the keys:

1. Clear browser cache and service workers
2. Reload the page
3. Click "Enable" on the push notification prompt
4. You should see success without errors in the console

## Notes

- VAPID keys must be valid EC P-256 keys
- The public key should be 88 characters (base64url encoded)
- Never commit the private key to version control
- Each environment (dev, staging, prod) should have its own keys
