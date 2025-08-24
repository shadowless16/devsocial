// Test script to check referral completion logic
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://niitsocialhub:devsocial@cluster0.5m149pf.mongodb.net/devsocial-frontend?retryWrites=true&w=majority&appName=Cluster0';

async function testReferralCompletion() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const referrals = db.collection('referrals');
    const users = db.collection('users');
    const userStats = db.collection('userstats');
    
    // Find pending referrals
    const pendingReferrals = await referrals.find({ status: "pending" }).toArray();
    console.log(`Found ${pendingReferrals.length} pending referrals`);
    
    for (const referral of pendingReferrals) {
      console.log(`\nChecking referral ${referral._id}:`);
      
      // Get referred user
      const referredUser = await users.findOne({ _id: referral.referred });
      if (!referredUser) {
        console.log('  ❌ Referred user not found');
        continue;
      }
      
      console.log(`  👤 Referred user: ${referredUser.username}`);
      console.log(`  💰 User points: ${referredUser.points || 0}`);
      
      // Get user stats
      const stats = await userStats.findOne({ user: referral.referred });
      if (stats) {
        console.log(`  📊 Total posts: ${stats.totalPosts || 0}`);
        console.log(`  ⭐ Total XP: ${stats.totalXP || 0}`);
        
        // Check completion criteria
        const hasMinimumActivity = stats.totalXP >= 25;
        console.log(`  ✅ Meets criteria (25+ XP): ${hasMinimumActivity}`);
        
        if (hasMinimumActivity) {
          console.log(`  🎉 This referral should be completed!`);
        }
      } else {
        console.log('  ❌ No user stats found');
      }
    }
    
    // Also check completed referrals
    const completedReferrals = await referrals.find({ status: "completed" }).toArray();
    console.log(`\n📈 Found ${completedReferrals.length} completed referrals`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testReferralCompletion();