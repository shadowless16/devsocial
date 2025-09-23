# Referral System Debug Guide

This guide helps you debug and test the referral system, specifically for checking why referrals might not be tracking properly.

## 🚀 Quick Start

### Option 1: Use the Batch File (Windows)
```bash
# Run the interactive debug menu
./debug-referrals.bat
```

### Option 2: Use NPM Scripts
```bash
# Debug AkDavid's referrals specifically
pnpm run debug:referrals

# Test the referral signup flow
pnpm run test:referral-signup

# Run the MCP server for advanced debugging
pnpm run mcp:referral-debug
```

## 🔍 What Each Tool Does

### 1. `debug:referrals` - AkDavid Referral Analysis
This script will:
- ✅ Find AkDavid's user account
- 📧 Check/create his referral code
- 📤 List all referrals he's made
- 🔧 Check for pending referrals that should be completed
- 🧪 Test referral code validation
- 📊 Show comprehensive stats

**Expected Output:**
```
👤 Found AkDavid: AkDavid (email@example.com)
📧 Referral Code: AKDA1234ABCD
⭐ Current XP: 150

📤 REFERRALS MADE BY AKDAVID (3 total):
1. john_doe (@john@example.com)
   Status: completed
   Created: 2024-01-15
   Referred User XP: 75
   Completed: 2024-01-16
```

### 2. `test:referral-signup` - Signup Flow Test
This script will:
- 🔗 Get AkDavid's referral code
- 🧪 Test the validation process
- 👤 Create a temporary test user
- ✅ Process the referral signup flow
- 🧹 Clean up test data

**Expected Output:**
```
🧪 TESTING SIGNUP FLOW:
Step 1: Validating referral code...
✅ Code validation: PASS
✅ Referrer found: AkDavid

Step 2: Simulating new user signup...
✅ Created test user: testuser_1234567890

Step 3: Testing referral processing...
✅ Referral processing: SUCCESS

🎉 REFERRAL TRACKING WORKING!
```

### 3. MCP Server - Advanced Debugging
The MCP server provides these tools:
- `check_akdavid_referrals` - Detailed AkDavid analysis
- `debug_referral_system` - System-wide debug info
- `validate_referral_code` - Test specific codes
- `fix_pending_referrals` - Auto-fix stuck referrals
- `get_referral_stats` - User-specific stats

## 🐛 Common Issues & Solutions

### Issue 1: "Could not find AkDavid user"
**Solution:** The script searches for variations of "AkDavid". If not found, it will list available users.

### Issue 2: "No referral code set"
**Solution:** The script will automatically create one if missing.

### Issue 3: "Pending referrals with enough XP"
**Symptoms:** Users have 25+ XP but referral status is still "pending"
**Solution:** Run the fix command:
```bash
pnpm run debug:referrals
# Look for "ISSUE: User has enough XP but referral is still pending!"
# The script will attempt to auto-fix these
```

### Issue 4: "Referral code validation fails"
**Symptoms:** Valid-looking codes return invalid
**Possible causes:**
- Code doesn't exist in database
- Referrer account is inactive
- Database connection issues

### Issue 5: "Signup flow works but referrals not created"
**Check these areas:**
1. `processReferralFromSignup` function execution
2. Database write permissions
3. Referral model validation
4. XP threshold settings (currently 25 XP)

## 📊 Understanding the Output

### Referral Status Meanings
- **pending**: Referral created but user hasn't met completion criteria (25 XP)
- **completed**: User met criteria, both parties got XP rewards
- **expired**: Referral expired (30 days) before completion

### XP Thresholds
- **Signup**: 10 XP (starting points)
- **Daily login**: +5 XP
- **Referral completion**: 25 XP minimum required
- **Referrer reward**: 25 XP
- **Referred user bonus**: 15 XP

## 🔧 Manual Fixes

### Fix Stuck Referrals
```javascript
// In MongoDB or via script
await ReferralSystemFixed.checkReferralCompletion(userId)
```

### Create Missing Referral Code
```javascript
const code = await ReferralSystemFixed.getReferralCode(userId)
```

### Force Complete Referral
```javascript
// Find the referral
const referral = await Referral.findById(referralId)
referral.status = 'completed'
referral.completedAt = new Date()
await referral.save()

// Award XP
await awardXP(referrerId, 'referral_success', referralId)
await awardXP(referredUserId, 'referral_bonus', referralId)
```

## 🎯 Testing New Referrals

1. Get AkDavid's referral code from debug output
2. Use this URL format: `http://localhost:3000/auth/signup?ref=AKDA1234ABCD`
3. Create a test account
4. Check if referral was created in database
5. Give test user 25+ XP
6. Run completion check

## 📞 Support

If issues persist after running these tools:
1. Check database connectivity
2. Verify environment variables
3. Check server logs during signup
4. Ensure ReferralSystemFixed is properly imported
5. Verify MongoDB indexes are created

## 🔗 Related Files
- `/utils/referral-system-fixed.ts` - Main referral logic
- `/models/Referral.ts` - Database schema
- `/app/api/auth/signup/route.ts` - Signup endpoint
- `/app/auth/signup/page.tsx` - Signup form