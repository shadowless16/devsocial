const { config } = require('dotenv');
const path = require('path');

config({ path: path.resolve(process.cwd(), '.env.local') });

const mongoose = require('mongoose');
const User = require('../models/User.ts');
const Referral = require('../models/Referral.ts');

async function fixMissingReferrals() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find AkDavid (the referrer)
    const akDavid = await User.findOne({ username: 'AkDavid' });
    if (!akDavid) {
      console.log('AkDavid not found');
      return;
    }

    console.log(`Found AkDavid with referral code: ${akDavid.referralCode}`);

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
        const user = await User.findOne({ username });
        if (!user) {
          console.log(`❌ User ${username} not found`);
          continue;
        }

        // Check if referral already exists
        const existingReferral = await Referral.findOne({ referred: user._id });
        if (existingReferral) {
          console.log(`⚠️  ${username} already has a referral: ${existingReferral.status}`);
          continue;
        }

        // Update user's registration source and referrer
        await User.findByIdAndUpdate(user._id, {
          registrationSource: 'referral',
          referrer: 'AkDavid'
        });

        // Create the missing referral
        const referral = new Referral({
          referrer: akDavid._id,
          referred: user._id,
          referralCode: akDavid.referralCode,
          status: 'pending',
          createdAt: user.createdAt, // Use original signup date
          expiresAt: new Date(user.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from signup
        });

        await referral.save();
        console.log(`✅ Created referral for ${username}`);

      } catch (error) {
        console.error(`❌ Error fixing referral for ${username}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('\n=== Verification ===\n');

    // Verify the fixes
    const allReferrals = await Referral.find({ referrer: akDavid._id })
      .populate('referred', 'username createdAt')
      .sort({ createdAt: -1 });

    console.log(`Total referrals for AkDavid: ${allReferrals.length}`);
    
    allReferrals.forEach((referral, index) => {
      console.log(`${index + 1}. ${referral.referred.username} - Status: ${referral.status} - Created: ${referral.createdAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Script completed');
  }
}

fixMissingReferrals();