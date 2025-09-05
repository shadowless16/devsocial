const path = require('path');
const { MongoClient } = require('mongodb');

// Simple database connection
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';
  const client = new MongoClient(uri);
  await client.connect();
  return client.db();
}

async function testReferralFlow() {
  let client;
  try {
    console.log("=== Testing Referral Flow ===");
    
    const db = await connectDB();
    
    // 1. Find a user with a referral code
    const referrerUser = await db.collection('users').findOne({ 
      referralCode: { $exists: true, $ne: null } 
    });
    
    if (!referrerUser) {
      console.log("No users with referral codes found");
      return;
    }
    
    console.log(`Found referrer: ${referrerUser.username} with code: ${referrerUser.referralCode}`);
    
    // 2. Check existing referrals for this user
    const existingReferrals = await db.collection('referrals').find({ 
      referrer: referrerUser._id 
    }).toArray();
    
    console.log(`\nExisting referrals for ${referrerUser.username}:`);
    
    for (let i = 0; i < existingReferrals.length; i++) {
      const ref = existingReferrals[i];
      const referred = await db.collection('users').findOne({ _id: ref.referred });
      
      console.log(`${i + 1}. ${referred?.username || 'Unknown'} - Status: ${ref.status}`);
      console.log(`   Registration Source: ${referred?.registrationSource || 'Unknown'}`);
      console.log(`   Referrer Field: "${referred?.referrer || ''}"`);
      console.log(`   Created: ${ref.createdAt}`);
      console.log(`   Completed: ${ref.completedAt || 'Not completed'}`);
      console.log(`   ---`);
    }
    
    // 3. Check for users who might have been referred but don't show up
    const usersWithDirectRegistration = await db.collection('users').find({
      registrationSource: 'direct',
      referrer: '',
      createdAt: { $gte: new Date('2024-01-01') }
    }).limit(10).toArray();
    
    console.log(`\nUsers with direct registration (might be missing referrals):`);
    usersWithDirectRegistration.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Created: ${user.createdAt}`);
    });
    
    // 4. Test the referral link format
    const referralLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?ref=${referrerUser.referralCode}`;
    console.log(`\nReferral link format: ${referralLink}`);
    
    // 5. Basic referral stats
    const totalReferrals = existingReferrals.length;
    const completedReferrals = existingReferrals.filter(ref => ref.status === 'completed').length;
    
    console.log(`\nReferral stats for ${referrerUser.username}:`);
    console.log(`  Total referrals: ${totalReferrals}`);
    console.log(`  Completed referrals: ${completedReferrals}`);
    console.log(`  Pending referrals: ${totalReferrals - completedReferrals}`);
    
  } catch (error) {
    console.error("Error testing referral flow:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the test
testReferralFlow().then(() => {
  console.log("\nTest completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});