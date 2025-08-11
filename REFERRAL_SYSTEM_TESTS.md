# Referral System Tests & Fixes

## Issues Found & Fixed

### 1. **ObjectId Aggregation Issue**
**Problem**: `getReferralStats` was using string userId in MongoDB aggregation instead of ObjectId
**Fix**: Convert userId to ObjectId before aggregation
```typescript
const userObjectId = new User.base.Types.ObjectId(userId)
const stats = await Referral.aggregate([
  { $match: { referrer: userObjectId } },
  // ...
])
```

### 2. **Missing UserStats Creation**
**Problem**: System assumed UserStats always exists, causing referral completion to fail
**Fix**: Create UserStats if missing during referral checks
```typescript
let userStats = await UserStats.findOne({ user: userId })
if (!userStats) {
  userStats = await UserStats.create({
    user: userId,
    totalPosts: 0,
    totalXP: user.points || 0,
    totalReferrals: 0
  })
}
```

### 3. **Expired Referral Handling**
**Problem**: System was checking expired referrals unnecessarily
**Fix**: Added expiration check in referral completion queries
```typescript
const pendingReferrals = await Referral.find({
  referred: userId,
  status: "pending",
  expiresAt: { $gt: new Date() }, // Only non-expired
})
```

### 4. **Error Handling**
**Problem**: Single referral failure could break entire batch processing
**Fix**: Added try-catch blocks around individual referral processing

## Test Files Created

### 1. `__tests__/referral-system.test.ts`
Comprehensive unit tests covering:
- ✅ Referral code generation and retrieval
- ✅ Referral creation with validation
- ✅ Referral completion logic
- ✅ Statistics aggregation
- ✅ Expiration handling
- ✅ Integration with XP system
- ✅ Error handling and edge cases

### 2. `__tests__/referral-api.test.ts`
API endpoint tests covering:
- ✅ GET /api/referrals/create (referral code retrieval)
- ✅ POST /api/referrals/create (referral creation)
- ✅ GET /api/referrals/stats (statistics)
- ✅ Authentication handling
- ✅ Input validation
- ✅ Error responses

### 3. `scripts/test-referral-manual.ts`
End-to-end manual test script that:
- ✅ Creates test users
- ✅ Simulates referral flow
- ✅ Tests completion criteria
- ✅ Verifies XP rewards
- ✅ Tests edge cases
- ✅ Validates statistics

## Running Tests

### Install Test Dependencies
```bash
npm install --save-dev jest @types/jest ts-jest mongodb-memory-server
```

### Run Unit Tests
```bash
npm test
```

### Run Manual Test
```bash
npx tsx scripts/test-referral-manual.ts
```

### Run Specific Test File
```bash
npm test referral-system.test.ts
npm test referral-api.test.ts
```

## Test Coverage

### Core Functionality ✅
- [x] Referral code generation
- [x] Referral creation
- [x] Duplicate prevention
- [x] Self-referral prevention
- [x] Completion criteria checking
- [x] XP reward distribution
- [x] Statistics calculation
- [x] Expiration handling

### Edge Cases ✅
- [x] Missing UserStats
- [x] Non-existent users
- [x] Expired referrals
- [x] Invalid ObjectIds
- [x] Database connection errors
- [x] Concurrent operations

### API Endpoints ✅
- [x] Authentication validation
- [x] Input validation
- [x] Error responses
- [x] Success responses
- [x] Data integrity

## Manual Testing Checklist

### 1. Basic Flow
- [ ] User A gets referral link from `/referrals` page
- [ ] User B signs up using referral link (`?ref=CODE`)
- [ ] Referral is created with "pending" status
- [ ] User B creates 1+ posts and gains 50+ XP
- [ ] Referral automatically completes
- [ ] Both users receive XP rewards
- [ ] Statistics update correctly

### 2. Edge Cases
- [ ] Invalid referral codes are handled gracefully
- [ ] Self-referral attempts are blocked
- [ ] Duplicate referrals are prevented
- [ ] Expired referrals don't complete
- [ ] Missing UserStats are created automatically

### 3. Performance
- [ ] Large numbers of referrals don't slow down the system
- [ ] Concurrent referral checks don't cause race conditions
- [ ] Database queries are optimized with proper indexes

## Production Deployment Notes

### Environment Variables
Ensure these are set in production:
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-jwt-secret
```

### Monitoring
- Monitor referral completion rates
- Track XP distribution accuracy
- Watch for failed referral checks in logs

### Cron Jobs
Set up automated referral checking:
```bash
# Every hour
0 * * * * curl -X POST https://yourapp.com/api/referrals/check-all
```

## Troubleshooting

### Common Issues
1. **"User not found" errors**: Check if user IDs are valid ObjectIds
2. **Referrals not completing**: Verify UserStats exist and meet criteria
3. **Statistics not updating**: Check ObjectId conversion in aggregation
4. **XP not awarded**: Verify awardXP function is working correctly

### Debug Commands
```bash
# Check referral system status
npx tsx scripts/test-referral-system.ts

# Manual referral check
curl -X POST http://localhost:3000/api/referrals/check-all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check database directly
mongo your-database
db.referrals.find({status: "pending"})
db.userstats.find({user: ObjectId("USER_ID")})
```

## Success Metrics

The referral system is working correctly when:
- ✅ All tests pass
- ✅ Manual test script completes successfully
- ✅ Referral completion rate > 80% for eligible users
- ✅ XP rewards are distributed accurately
- ✅ No errors in application logs
- ✅ Statistics match actual referral data