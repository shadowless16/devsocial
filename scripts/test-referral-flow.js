// Test script to verify referral system works
const mongoose = require('mongoose');
require('dotenv').config();

async function testReferralFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import models
    const User = require('../models/User').default;
    const Referral = require('../models/Referral').default;
    const UserStats = require('../models/UserStats').default;

    // Find a test user with referral code
    const referrer = await User.findOne({ referralCode: { $exists: true } });
    if (!referrer) {
      console.log('No user with referral code found');
      return;
    }

    console.log(`Found referrer: ${referrer.username} with code: ${referrer.referralCode}`);

    // Check referrals for this user
    const referrals = await Referral.find({ referrer: referrer._id })
      .populate('referred', 'username displayName')
      .sort({ createdAt: -1 });

    console.log(`Found ${referrals.length} referrals:`);
    referrals.forEach(ref => {
      console.log(`- ${ref.referred.username}: ${ref.status} (created: ${ref.createdAt})`);
    });

    // Check user stats
    const stats = await UserStats.find({ user: { $in: referrals.map(r => r.referred._id) } });
    console.log('\nReferred user stats:');
    stats.forEach(stat => {
      console.log(`- User ${stat.user}: ${stat.totalPosts} posts, ${stat.totalXP} XP`);
    });

    console.log('\nReferral system test completed');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testReferralFlow();