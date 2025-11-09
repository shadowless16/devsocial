# XP Overtake Notification Testing Guide

## Method 1: Command Line Test (Recommended)

### Run the automated test script:
```bash
pnpm tsx scripts/test-xp-overtake.ts
```

**What it does:**
1. Creates two test users (testuser_a with 1000 XP, testuser_b with 950 XP)
2. Creates initial leaderboard snapshot
3. Gives testuser_b 60 XP (now 1010 XP, overtaking testuser_a)
4. Checks for overtakes
5. Verifies notifications were created
6. Shows final leaderboard

**Expected output:**
```
🧪 Starting XP Overtake Test...

📝 Step 1: Setting up test users...
✅ Created User A: testuser_a with 1000 XP
✅ Created User B: testuser_b with 950 XP

📸 Step 2: Creating initial leaderboard snapshot...
✅ Initial snapshot created
   Rank 1: testuser_a (1000 XP)
   Rank 2: testuser_b (950 XP)

⚡ Step 3: User B earns 60 XP...
✅ User B now has 1010 XP

🔍 Step 4: Checking for overtakes...
✅ Overtake check completed: 1 overtakes detected

📬 Step 5: Verifying notifications...
✅ User B received overtake notification:
   "You just overtook @testuser_a in XP — keep it up!"
✅ User A received overtaken notification:
   "@testuser_b just overtook you in XP — time to level up!"

🏆 Step 6: Final Leaderboard:
   Rank 1: testuser_b (1010 XP)
   Rank 2: testuser_a (1000 XP)

🎉 TEST PASSED! XP Overtake system is working correctly!
```

## Method 2: Browser API Test

### Step 1: Setup test users
```bash
curl -X POST http://localhost:3000/api/test-overtake \
  -H "Content-Type: application/json" \
  -d '{"action": "setup"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Test users created",
  "users": {
    "userA": { "username": "testuser_a", "points": 1000 },
    "userB": { "username": "testuser_b", "points": 950 }
  }
}
```

### Step 2: Trigger overtake
```bash
curl -X POST http://localhost:3000/api/test-overtake \
  -H "Content-Type: application/json" \
  -d '{"action": "overtake"}'
```

**Expected response:**
```json
{
  "success": true,
  "overtakes": 1,
  "userB": { "username": "testuser_b", "points": 1010 },
  "notifications": [
    {
      "recipient": "testuser_b",
      "sender": "testuser_a",
      "type": "xp_overtake",
      "message": "You just overtook @testuser_a in XP — keep it up!"
    },
    {
      "recipient": "testuser_a",
      "sender": "testuser_b",
      "type": "xp_overtaken",
      "message": "@testuser_b just overtook you in XP — time to level up!"
    }
  ]
}
```

### Step 3: Check status
```bash
curl http://localhost:3000/api/test-overtake
```

### Step 4: Cleanup
```bash
curl -X POST http://localhost:3000/api/test-overtake \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'
```

## Method 3: Test Push Notifications

### Prerequisites:
1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Add to `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:admin@devsocial.com
```

### Run push notification test:
```bash
pnpm tsx scripts/test-push-notification.ts
```

**What it does:**
1. Checks VAPID configuration
2. Finds users with push subscriptions
3. Sends test push notification
4. Verifies notification format

**Expected output:**
```
🔔 Testing Push Notification System...

🔑 Step 1: Checking VAPID configuration...
✅ VAPID keys configured
   Public Key: BKxT...

👤 Step 2: Looking for users with push subscriptions...
✅ Found 1 user(s) with push subscriptions
   - yourusername

📤 Step 3: Sending test notification to yourusername...
✅ Push notification sent successfully!

Check your browser for the notification.

📬 Step 4: Testing XP overtake notification format...
✅ Overtake notification format:
   Title: 🔥 XP Overtake!
   Body: You just overtook @TestUser in XP — keep it up!
   URL: /leaderboard

🎉 Push notification system is working!
```

## Method 4: Real User Test

### Step 1: Create two real accounts
1. Sign up as User A
2. Sign up as User B

### Step 2: Set initial XP
Use admin panel or database to set:
- User A: 1000 XP
- User B: 950 XP

### Step 3: Give User B XP
Award User B 60+ XP through normal actions (posts, comments, etc.)

### Step 4: Check notifications
1. Login as User A → Check notification bell
2. Login as User B → Check notification bell

### Step 5: Test push notifications
1. Enable push notifications for both users
2. Close browser for User A
3. Give User B more XP to overtake User A
4. User A should receive browser push notification

## Troubleshooting

### No overtakes detected
- Verify snapshots exist: Check `LeaderboardSnapshot` collection
- Ensure XP difference is significant (≥10 XP change)
- Check console logs for errors

### Notifications not created
- Verify Notification model has new types: `xp_overtake`, `xp_overtaken`
- Check database connection
- Review `XPOvertakeService` logs

### Push notifications not working
- Ensure VAPID keys are configured
- Verify service worker is registered
- Check browser supports push notifications
- Must use HTTPS (or localhost)

### Cron not running
- Verify `vercel.json` exists in root
- Check Vercel dashboard → Cron Jobs
- Ensure `CRON_SECRET` is set

## Quick Verification Checklist

- [ ] Test script runs without errors
- [ ] Two test users created
- [ ] Leaderboard snapshot saved
- [ ] Overtake detected (1 overtake)
- [ ] Both users receive notifications
- [ ] Notification messages are correct
- [ ] Push notifications configured (optional)
- [ ] Push notification sent successfully (optional)

## Success Criteria

✅ **Test passes if:**
1. Overtake is detected when User B surpasses User A
2. User B receives "You just overtook @testuser_a" notification
3. User A receives "@testuser_b just overtook you" notification
4. Final leaderboard shows correct ranking
5. Push notifications work (if configured)

## Next Steps After Testing

1. ✅ Verify tests pass
2. Add `<PushNotificationPrompt />` to authenticated layout
3. Deploy to production
4. Monitor Vercel cron logs
5. Check user feedback on notifications
