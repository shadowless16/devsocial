/**
 * Test Referral Flow - Ensures referrals work correctly
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testReferralFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const referralsCollection = db.collection('referrals');

    console.log('=== REFERRAL SYSTEM HEALTH CHECK ===\n');

    // 1. Check all users have referral codes
    const usersWithoutCode = await usersCollection.countDocuments({
      referralCode: { $exists: false }
    });
    console.log(`✅ Users without referral code: ${usersWithoutCode} (should be 0)`);

    // 2. Check referrals collection integrity
    const totalReferrals = await referralsCollection.countDocuments();
    const referralsWithCode = await referralsCollection.countDocuments({
      referralCode: { $exists: true, $ne: '' }
    });
    console.log(`✅ Total referrals: ${totalReferrals}`);
    console.log(`✅ Referrals with code: ${referralsWithCode} (should match total)`);

    // 3. Check for orphaned referrals (referrer doesn't exist)
    const allReferrals = await referralsCollection.find().toArray();
    let orphanedCount = 0;
    for (const ref of allReferrals) {
      const referrerExists = await usersCollection.findOne({ _id: ref.referrer });
      if (!referrerExists) {
        orphanedCount++;
        console.log(`⚠️  Orphaned referral: ${ref._id} (referrer not found)`);
      }
    }
    console.log(`✅ Orphaned referrals: ${orphanedCount} (should be 0)`);

    // 4. Check users.referrer field matches referrals collection
    const usersWithReferrer = await usersCollection.find({
      referrer: { $exists: true, $ne: '', $ne: null }
    }).toArray();

    let mismatchCount = 0;
    for (const user of usersWithReferrer) {
      const referralExists = await referralsCollection.findOne({ referred: user._id });
      if (!referralExists) {
        mismatchCount++;
        console.log(`⚠️  User ${user.username} has referrer "${user.referrer}" but no referral record`);
      }
    }
    console.log(`✅ Users with referrer but no referral record: ${mismatchCount} (should be 0)`);

    // 5. Verify referral codes match user profiles
    const referralCodes = await referralsCollection.distinct('referralCode');
    let codeMismatchCount = 0;
    for (const code of referralCodes) {
      const userWithCode = await usersCollection.findOne({ referralCode: code });
      if (!userWithCode) {
        codeMismatchCount++;
        console.log(`⚠️  Referral code "${code}" doesn't match any user`);
      }
    }
    console.log(`✅ Referral codes without matching user: ${codeMismatchCount} (should be 0)`);

    console.log('\n=== SUMMARY ===');
    const allGood = usersWithoutCode === 0 && 
                    referralsWithCode === totalReferrals && 
                    orphanedCount === 0 && 
                    mismatchCount === 0 && 
                    codeMismatchCount === 0;

    if (allGood) {
      console.log('🎉 ALL CHECKS PASSED! Referral system is healthy.');
    } else {
      console.log('⚠️  ISSUES DETECTED! Run sync-missing-referrals.js to fix.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testReferralFlow();
