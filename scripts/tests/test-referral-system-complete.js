const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function testReferralSystem() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const users = db.collection('users');
    const referrals = db.collection('referrals');
    const userStats = db.collection('userstats');
    
    console.log('\n=== REFERRAL SYSTEM COMPREHENSIVE TEST ===\n');
    
    // 1. Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const testUser = await users.findOne({ username: { $exists: true } });
    if (!testUser) {
      console.log('❌ No users found for testing');
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.username}`);
    console.log(`   Referral code: ${testUser.referralCode || 'NOT SET'}`);
    
    // 2. Check existing referrals
    console.log('\n2️⃣ Checking existing referrals...');
    const totalReferrals = await referrals.countDocuments();
    const pendingReferrals = await referrals.countDocuments({ status: 'pending' });
    const completedReferrals = await referrals.countDocuments({ status: 'completed' });
    const expiredReferrals = await referrals.countDocuments({ status: 'expired' });
    
    console.log(`   Total referrals: ${totalReferrals}`);
    console.log(`   Pending: ${pendingReferrals}`);
    console.log(`   Completed: ${completedReferrals}`);
    console.log(`   Expired: ${expiredReferrals}`);
    
    // 3. Test referral creation simulation
    console.log('\n3️⃣ Testing referral creation simulation...');
    const allUsers = await users.find({}).limit(5).toArray();
    
    if (allUsers.length >= 2) {
      const referrer = allUsers[0];
      const referred = allUsers[1];
      
      // Check if referral already exists
      const existingReferral = await referrals.findOne({
        referrer: referrer._id,
        referred: referred._id
      });
      
      if (!existingReferral) {
        const testReferral = {
          referrer: referrer._id,
          referred: referred._id,
          referralCode: referrer.referralCode || `TEST${Date.now()}`,
          status: 'pending',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          rewardsClaimed: false,
          referrerReward: 25,
          referredReward: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await referrals.insertOne(testReferral);
        console.log(`✅ Created test referral: ${result.insertedId}`);
        console.log(`   ${referrer.username} -> ${referred.username}`);
        
        // Clean up test referral
        await referrals.deleteOne({ _id: result.insertedId });
        console.log('🧹 Cleaned up test referral');
      } else {
        console.log(`ℹ️  Referral already exists between ${referrer.username} and ${referred.username}`);
      }
    }
    
    // 4. Test referral completion logic
    console.log('\n4️⃣ Testing referral completion logic...');
    const pendingReferralsList = await referrals.find({ status: 'pending' })
      .limit(5)
      .toArray();
    
    console.log(`Found ${pendingReferralsList.length} pending referrals to check:`);
    
    for (const referral of pendingReferralsList) {
      const referredUser = await users.findOne({ _id: referral.referred });
      const referredStats = await userStats.findOne({ user: referral.referred });
      
      if (referredUser) {
        const totalXP = referredStats?.totalXP || referredUser.points || 0;
        const shouldComplete = totalXP >= 25;
        
        console.log(`   Referral ${referral._id.toString().slice(-6)}:`);
        console.log(`     Referred user XP: ${totalXP}`);
        console.log(`     Should complete: ${shouldComplete ? '✅' : '❌'}`);
        
        if (shouldComplete && referral.status === 'pending') {
          console.log(`     🔄 This referral should be completed!`);
        }
      }
    }
    
    // 5. Test signup flow simulation
    console.log('\n5️⃣ Testing signup flow simulation...');
    const referrerForSignup = await users.findOne({ referralCode: { $exists: true, $ne: null } });
    
    if (referrerForSignup) {
      console.log(`✅ Found referrer with code: ${referrerForSignup.referralCode}`);
      console.log('   Simulating new user signup with this referral code...');
      
      // Simulate what happens in signup
      const simulatedNewUser = {
        _id: 'SIMULATED_USER_ID',
        username: 'testuser_' + Date.now(),
        points: 10 // Starting XP
      };
      
      console.log(`   New user would get: ${simulatedNewUser.points} XP`);
      console.log(`   Completion threshold: 25 XP`);
      console.log(`   Would complete immediately: ${simulatedNewUser.points >= 25 ? '✅' : '❌'}`);
    }
    
    // 6. Test expired referrals
    console.log('\n6️⃣ Checking for expired referrals...');
    const expiredCount = await referrals.countDocuments({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`   Found ${expiredCount} referrals that should be expired`);
    
    // 7. Performance test
    console.log('\n7️⃣ Performance test...');
    const startTime = Date.now();
    
    await referrals.find({ status: 'pending' }).limit(100).toArray();
    await users.find({ referralCode: { $exists: true } }).limit(100).toArray();
    
    const endTime = Date.now();
    console.log(`   Query performance: ${endTime - startTime}ms`);
    
    // 8. Data integrity check
    console.log('\n8️⃣ Data integrity check...');
    const referralsWithInvalidReferrer = await referrals.countDocuments({
      referrer: { $exists: false }
    });
    const referralsWithInvalidReferred = await referrals.countDocuments({
      referred: { $exists: false }
    });
    
    console.log(`   Referrals with invalid referrer: ${referralsWithInvalidReferrer}`);
    console.log(`   Referrals with invalid referred: ${referralsWithInvalidReferred}`);
    
    // 9. Summary and recommendations
    console.log('\n📊 SUMMARY AND RECOMMENDATIONS:');
    console.log('================================');
    
    if (pendingReferrals > 0) {
      console.log(`⚠️  You have ${pendingReferrals} pending referrals that may need processing`);
    }
    
    if (expiredCount > 0) {
      console.log(`⚠️  You have ${expiredCount} referrals that should be marked as expired`);
    }
    
    const usersWithoutReferralCode = await users.countDocuments({
      referralCode: { $exists: false }
    });
    
    if (usersWithoutReferralCode > 0) {
      console.log(`⚠️  ${usersWithoutReferralCode} users don't have referral codes`);
    }
    
    console.log('✅ Referral system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testReferralSystem();