const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function fixPendingReferrals() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('devsocial-frontend');
    const users = db.collection('users');
    const referrals = db.collection('referrals');
    const userStats = db.collection('userstats');
    
    console.log('\n=== FIXING PENDING REFERRALS ===\n');
    
    // Get all pending referrals
    const pendingReferrals = await referrals.find({ 
      status: 'pending',
      expiresAt: { $gt: new Date() } // Only non-expired ones
    }).toArray();
    
    console.log(`Found ${pendingReferrals.length} pending referrals to check`);
    
    let fixed = 0;
    let expired = 0;
    let errors = 0;
    
    for (const referral of pendingReferrals) {
      try {
        console.log(`\nProcessing referral ${referral._id.toString().slice(-6)}...`);
        
        // Get referred user
        const referredUser = await users.findOne({ _id: referral.referred });
        if (!referredUser) {
          console.log('  ❌ Referred user not found');
          errors++;
          continue;
        }
        
        // Get or create user stats
        let userStatsDoc = await userStats.findOne({ user: referral.referred });
        if (!userStatsDoc) {
          console.log('  📊 Creating missing UserStats...');
          userStatsDoc = {
            user: referral.referred,
            totalPosts: 0,
            totalXP: referredUser.points || 0,
            totalReferrals: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await userStats.insertOne(userStatsDoc);
        }
        
        const totalXP = userStatsDoc.totalXP || referredUser.points || 0;
        console.log(`  User: ${referredUser.username}, XP: ${totalXP}`);
        
        // Check if should be completed (lowered threshold to 25)
        if (totalXP >= 25) {
          console.log('  ✅ Completing referral...');
          
          await referrals.updateOne(
            { _id: referral._id },
            {
              $set: {
                status: 'completed',
                completedAt: new Date(),
                rewardsClaimed: true,
                updatedAt: new Date()
              }
            }
          );
          
          // Update referrer's total referrals
          await userStats.updateOne(
            { user: referral.referrer },
            { 
              $inc: { totalReferrals: 1 },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );
          
          fixed++;
          console.log('  ✅ Referral completed!');
        } else {
          console.log(`  ⏳ Still pending (needs ${25 - totalXP} more XP)`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing referral:`, error.message);
        errors++;
      }
    }
    
    // Handle expired referrals
    console.log('\n🕐 Checking for expired referrals...');
    const expiredResult = await referrals.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: {
          status: 'expired',
          updatedAt: new Date()
        }
      }
    );
    
    expired = expiredResult.modifiedCount;
    console.log(`⏰ Marked ${expired} referrals as expired`);
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`✅ Fixed (completed): ${fixed}`);
    console.log(`⏰ Expired: ${expired}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📋 Total processed: ${pendingReferrals.length}`);
    
    // Final stats
    const finalStats = await referrals.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\n📈 Current referral status distribution:');
    finalStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });
    
    console.log('\n✅ Referral fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixPendingReferrals();