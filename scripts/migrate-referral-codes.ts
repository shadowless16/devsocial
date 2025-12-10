// import { config } from "dotenv"
// import path from "path"

// // Load environment variables from .env.local BEFORE importing other modules
// config({ path: path.resolve(process.cwd(), '.env.local') })

// // Now import modules that depend on environment variables
// import connectDB from "../lib/db"
// import User from "../models/User"

// async function migrateReferralCodes() {
//   try {
//     await connectDB()
//     console.log("Connected to database")

//     // Find all users without referral codes
//     const usersWithoutCodes = await User.find({ 
//       $or: [
//         { referralCode: { $exists: false } },
//         { referralCode: null },
//         { referralCode: "" }
//       ]
//     })

//     console.log(`Found ${usersWithoutCodes.length} users without referral codes`)

//     let updated = 0
//     let failed = 0

//     for (const user of usersWithoutCodes) {
//       try {
//         // Generate referral code
//         const timestamp = Date.now().toString(36)
//         const username = user.username.substring(0, 4).toUpperCase()
//         const random = Math.random().toString(36).substring(2, 6).toUpperCase()
//         const referralCode = `${username}${timestamp}${random}`

//         // Update user
//         user.referralCode = referralCode
//         await user.save()

//         console.log(`✅ Updated ${user.username} with referral code: ${referralCode}`)
//         updated++
//       } catch (error: unknown) {
//         console.error(`❌ Failed to update ${user.username}:`, error)
//         failed++
//       }
//     }

//     console.log(`
// === Migration Complete ===
// Total users processed: ${usersWithoutCodes.length}
// Successfully updated: ${updated}
// Failed: ${failed}
// `)

//     process.exit(0)
//   } catch (error: unknown) {
//     console.error("Migration failed:", error)
//     process.exit(1)
//   }
// }

// // Run the migration
// migrateReferralCodes()
