const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixMissingReferrals() {
  let client;
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to database');

    // Find AkDavid (the referrer)
    const akDavid = await db.collection('users').findOne({ username: 'AkDavid' });
    if (!akDavid) {
      console.log('❌ AkDavid not found');
      return;
    }

    console.log(`👤 Found AkDavid with referral code: ${akDavid.referralCode}`);

    // Users that should have been referred by AkDavid
    const usersToFix = [
      '_toxicity_',
      'Neeza', 
      'lulu',
      'Lady_Vi',
      'Lyon',
      'tosin'
    ];

    console.log('\n=== Fixing Missing Referrals ===\n');

    for (const username of usersToFix) {
      try {
        // Find the user
        const user = await db.collection('users').findOne({ username });
        if (!user) {
          console.log(`❌ User ${username} not found`);
          continue;
        }

        // Check if referral already exists
        const existingReferral = await db.collection('referrals').findOne({ referred: user._id });
        if (existingReferral) {
          console.log(`⚠️  ${username} already has a referral: ${existingReferral.status}`);
          continue;
        }

        // Update user's registration source and referrer
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: {
              registrationSource: 'referral',
              referrer: 'AkDavid'
            }
          }
        );

        // Create the missing referral with a unique referral code
        const uniqueReferralCode = `${akDavid.referralCode}-${user._id.toString().slice(-6)}`;
        const referral = {
          referrer: akDavid._id,
          referred: user._id,
          referralCode: uniqueReferralCode,
          status: 'pending',
          createdAt: user.createdAt, // Use original signup date
          expiresAt: new Date(user.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from signup
          rewardsClaimed: false,
          referrerReward: 25,
          referredReward: 15,
          updatedAt: new Date()
        };

        await db.collection('referrals').insertOne(referral);
        console.log(`✅ Created referral for ${username}`);

      } catch (error) {
        console.error(`❌ Error fixing referral for ${username}:`, error.message);
      }
    }

    console.log('\n=== Verification ===\n');

    // Verify the fixes
    const allReferrals = await db.collection('referrals')
      .find({ referrer: akDavid._id })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📊 Total referrals for AkDavid: ${allReferrals.length}`);
    
    // Get referred user details for each referral
    for (let i = 0; i < allReferrals.length; i++) {
      const referral = allReferrals[i];
      const referredUser = await db.collection('users').findOne({ _id: referral.referred });
      console.log(`${i + 1}. ${referredUser?.username || 'Unknown'} - Status: ${referral.status} - Created: ${referral.createdAt}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
    console.log('\n✅ Script completed');
  }
}

fixMissingReferrals();