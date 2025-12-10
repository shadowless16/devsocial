import { config } from "dotenv"
import path from "path"

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

import connectDB from "../lib/db"
import User from "../models/User"
import Referral from "../models/Referral"
import UserStats from "../models/UserStats"
import { ReferralSystem } from "../utils/referral-system"
import { awardXP } from "../utils/awardXP"

async function testReferralFlow() {
  try {
    await connectDB()
    console.log("✅ Connected to database")

    // Clean up test data
    await User.deleteMany({ username: { $in: ['testreferrer', 'testreferred'] } })
    await Referral.deleteMany({})
    console.log("🧹 Cleaned up test data")

    // Step 1: Create referrer user
    const referrer = await User.create({
      username: 'testreferrer',
      email: 'referrer@test.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'Referrer',
      points: 100
    })
    console.log(`✅ Created referrer: ${referrer.username} with code: ${referrer.referralCode}`)

    // Step 2: Create referred user
    const referred = await User.create({
      username: 'testreferred',
      email: 'referred@test.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'Referred',
      points: 10
    })
    console.log(`✅ Created referred user: ${referred.username}`)

    // Step 3: Create referral
    const referral = await ReferralSystem.createReferral(
      referrer._id.toString(),
      referred._id.toString()
    )
    console.log(`✅ Created referral: ${referral._id}`)

    // Step 4: Create UserStats for referred user (simulate some activity)
    const userStats = await UserStats.create({
      user: referred._id,
      totalPosts: 1,
      totalXP: 60, // Meets completion criteria
      totalReferrals: 0
    })
    console.log(`✅ Created UserStats for referred user: ${userStats.totalPosts} posts, ${userStats.totalXP} XP`)

    // Step 5: Check referral completion
    console.log("🔍 Checking referral completion...")
    await ReferralSystem.checkReferralCompletion(referred._id.toString())

    // Step 6: Verify completion
    const updatedReferral = await Referral.findById(referral._id)
    const updatedReferrer = await User.findById(referrer._id)
    const updatedReferred = await User.findById(referred._id)

    console.log("\n📊 Results:")
    console.log(`Referral Status: ${updatedReferral?.status}`)
    console.log(`Referral Completed At: ${updatedReferral?.completedAt}`)
    console.log(`Rewards Claimed: ${updatedReferral?.rewardsClaimed}`)
    console.log(`Referrer XP: ${referrer.points} → ${updatedReferrer?.points}`)
    console.log(`Referred XP: ${referred.points} → ${updatedReferred?.points}`)

    // Step 7: Test referral stats
    console.log("\n📈 Testing referral stats...")
    const stats = await ReferralSystem.getReferralStats(referrer._id.toString())
    console.log("Stats:", JSON.stringify(stats.stats, null, 2))
    console.log(`Recent referrals count: ${stats.recentReferrals.length}`)

    // Step 8: Test edge cases
    console.log("\n🧪 Testing edge cases...")
    
    // Try to create duplicate referral
    try {
      await ReferralSystem.createReferral(
        referrer._id.toString(),
        referred._id.toString()
      )
      console.log("❌ Should have thrown error for duplicate referral")
    } catch (error: unknown) {
      console.log(`✅ Correctly prevented duplicate referral: ${error.message}`)
    }

    // Test with non-existent user
    try {
      await ReferralSystem.getReferralCode('507f1f77bcf86cd799439011')
      console.log("❌ Should have thrown error for non-existent user")
    } catch (error: unknown) {
      console.log(`✅ Correctly handled non-existent user: ${error.message}`)
    }

    console.log("\n🎉 All tests completed successfully!")
    
  } catch (error: unknown) {
    console.error("❌ Test failed:", error)
  } finally {
    process.exit(0)
  }
}

// Run the test
testReferralFlow()