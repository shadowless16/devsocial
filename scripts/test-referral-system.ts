// import { config } from "dotenv"
// import path from "path"

// // Load environment variables from .env.local
// config({ path: path.resolve(process.cwd(), '.env.local') })

// import connectDB from "../lib/db"
// import User from "../models/User"
// import Referral from "../models/Referral"
// import UserStats from "../models/UserStats"
// import { ReferralSystem } from "../utils/referral-system"

// async function testReferralSystem() {
//   try {
//     await connectDB()
//     console.log("Connected to database")

//     // Test 1: Check if users have referral codes
//     const users = await User.find({}).limit(5)
//     console.log("\n=== Testing User Referral Codes ===")
//     for (const user of users) {
//       if (!user.referralCode) {
//         console.log(`❌ User ${user.username} missing referral code`)
//       } else {
//         console.log(`✅ User ${user.username} has referral code: ${user.referralCode}`)
//       }
//     }

//     // Test 2: Check pending referrals
//     console.log("\n=== Checking Pending Referrals ===")
//     const pendingReferrals = await Referral.find({ status: "pending" })
//       .populate("referrer", "username")
//       .populate("referred", "username")
//       .limit(10)

//     console.log(`Found ${pendingReferrals.length} pending referrals`)
    
//     for (const referral of pendingReferrals) {
//       const userStats = await UserStats.findOne({ user: referral.referred._id })
//       console.log(`
// Referral: ${referral.referrer.username} → ${referral.referred.username}
// - Status: ${referral.status}
// - Created: ${referral.createdAt}
// - Expires: ${referral.expiresAt}
// - User Stats: ${userStats ? `${userStats.totalPosts} posts, ${userStats.totalXP} XP` : 'No stats found'}
// - Eligible: ${userStats && userStats.totalPosts >= 1 && userStats.totalXP >= 50 ? 'YES' : 'NO'}
// `)
//     }

//     // Test 3: Test completion check for a specific user
//     if (users.length > 0) {
//       console.log("\n=== Testing Referral Completion Check ===")
//       const testUser = users[0]
//       console.log(`Testing completion check for user: ${testUser.username}`)
      
//       try {
//         await ReferralSystem.checkReferralCompletion(testUser._id.toString())
//         console.log("✅ Completion check completed successfully")
//       } catch (error) {
//         console.log("❌ Completion check failed:", error)
//       }
//     }

//     // Test 4: Check expired referrals
//     console.log("\n=== Checking for Expired Referrals ===")
//     const expiredReferrals = await Referral.find({ 
//       status: "pending",
//       expiresAt: { $lt: new Date() }
//     }).count()
//     console.log(`Found ${expiredReferrals} referrals that should be expired`)

//     if (expiredReferrals > 0) {
//       await ReferralSystem.expireOldReferrals()
//       console.log("✅ Expired referrals have been updated")
//     }

//     console.log("\n=== Test Complete ===")
//     process.exit(0)
//   } catch (error) {
//     console.error("Test failed:", error)
//     process.exit(1)
//   }
// }

// // Run the test
// testReferralSystem()
