const { MongoClient } = require('mongodb');

async function checkUsers() {
  let client;
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsocial';
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    console.log("=== Database Users Check ===");
    
    // Count total users
    const totalUsers = await db.collection('users').countDocuments();
    console.log(`Total users: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log("No users found in database");
      return;
    }
    
    // Check users with referral codes
    const usersWithCodes = await db.collection('users').countDocuments({ 
      referralCode: { $exists: true, $ne: null } 
    });
    console.log(`Users with referral codes: ${usersWithCodes}`);
    
    // Show first 5 users
    const sampleUsers = await db.collection('users').find({}).limit(5).toArray();
    console.log("\nSample users:");
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || user.email || 'No name'}`);
      console.log(`   Email: ${user.email || 'No email'}`);
      console.log(`   Referral Code: ${user.referralCode || 'None'}`);
      console.log(`   Registration Source: ${user.registrationSource || 'Unknown'}`);
      console.log(`   Created: ${user.createdAt || 'Unknown'}`);
      console.log(`   ---`);
    });
    
    // Check referrals collection
    const totalReferrals = await db.collection('referrals').countDocuments();
    console.log(`\nTotal referrals: ${totalReferrals}`);
    
    if (totalReferrals > 0) {
      const sampleReferrals = await db.collection('referrals').find({}).limit(3).toArray();
      console.log("\nSample referrals:");
      sampleReferrals.forEach((ref, index) => {
        console.log(`${index + 1}. Referrer: ${ref.referrer}, Referred: ${ref.referred}`);
        console.log(`   Status: ${ref.status}, Created: ${ref.createdAt}`);
        console.log(`   ---`);
      });
    }
    
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkUsers().then(() => {
  console.log("\nCheck completed");
  process.exit(0);
}).catch((error) => {
  console.error("Check failed:", error);
  process.exit(1);
});