# Referral System Testing Guide

## Prerequisites
1. Make sure your MongoDB is running
2. Make sure you have at least 2 user accounts for testing

## Fix Existing Users Without Referral Codes
If you have existing users without referral codes (like the user in your screenshot), run:

```bash
npx tsx scripts/migrate-referral-codes.ts
```

This will generate referral codes for all existing users.

## Manual Testing Steps

### 1. Test Referral Code Generation
1. Log in as an existing user
2. Go to `/referrals` page
3. You should see your unique referral link
4. The link should show the current domain (localhost:3000 in dev, your actual domain in production)

### 2. Test Referral Link Signup
1. Copy the referral link from User A
2. Open an incognito/private browser window
3. Paste the referral link and go to the signup page
4. The URL should have `?ref=REFERRALCODE` at the end
5. Sign up as a new user (User B)
6. Check MongoDB to verify a new Referral document was created:
   - Status should be "pending"
   - Should link User A (referrer) and User B (referred)

### 3. Test Referral Completion
1. Log in as User B (the referred user)
2. Create at least 1 post
3. User B should now have at least 50 XP (10 from signup + XP from post)
4. Do one of the following to trigger the check:
   - User A: Visit the `/referrals` page (this triggers automatic check)
   - User B: Create another post (this triggers check via XP system)
   - Make a POST request to `/api/referrals/check-all` (manual trigger)

### 4. Verify Completion
1. Check MongoDB - the Referral document should now show:
   - Status: "completed"
   - completedAt: timestamp
   - rewardsClaimed: true
2. Check both users' XP:
   - User A should have +25 XP
   - User B should have +15 XP
3. User A's referral dashboard should show:
   - "Successful Referrals: 1"
   - The referral in the list with "completed" status

### 5. Test Edge Cases
- Try using an invalid referral code in the signup URL
- Try referring yourself (should not work)
- Try using the same referral code multiple times with the same email

## Using the Test Scripts

### Check System Status
```bash
npx tsx scripts/test-referral-system.ts
```

This will show:
- Users with/without referral codes
- Pending referrals and their eligibility
- Expired referrals

### Manual Referral Check (API)
You can trigger a manual check of all pending referrals:

```bash
# Using curl (replace YOUR_AUTH_TOKEN with actual token)
curl -X POST http://localhost:3000/api/referrals/check-all \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Or use a tool like Postman/Insomnia
```

## Production Notes
1. The `window.location.origin` will automatically use the correct domain in production
2. Consider setting up an external cron service (like Easycron) to periodically call `/api/referrals/check-all`
3. Monitor the referral completion rate to ensure the automatic checks are working

## Troubleshooting
- **No referral code showing**: Run the migration script
- **Referral not completing**: Check if the referred user has 1 post and 50+ XP
- **Links showing localhost in production**: Clear browser cache and reload the page
