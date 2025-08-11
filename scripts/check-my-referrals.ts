import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(process.cwd(), '.env.local') })

import connectDB from "../lib/db"
import User from "../models/User"
import Referral from "../models/Referral"
import { ReferralSystem } from "../utils/referral-system"

async function checkMyReferrals() {
  try {
    await connectDB()
    console.log("✅ Connected to database")

    // Find your user account (assuming username is AkDavid or similar)
    const possibleUsernames = ['AkDavid', 'akdavid', 'Ak David', 'ak david']
    let myUser = null

    for (const username of possibleUsernames) {
      myUser = await User.findOne({ 
        $or: [
          { username: { $regex: new RegExp(`^${username}$`, 'i') } },
          { email: { $regex: new RegExp(`${username}`, 'i') } }
        ]
      })
      if (myUser) break
    }

    if (!myUser) {
      console.log("❌ Could not find your user account")
      console.log("Available users:")
      const users = await User.find({}).limit(10).select('username email')
      users.forEach(user => console.log(`- ${user.username} (${user.email})`))
      return
    }

    console.log(`\n👤 Found your account: ${myUser.username} (${myUser.email})`)
    console.log(`📧 Referral Code: ${myUser.referralCode}`)

    // Get referral statistics
    const stats = await ReferralSystem.getReferralStats(myUser._id.toString())
    
    console.log("\n📊 Your Referral Statistics:")
    console.log("=" .repeat(40))
    
    if (Object.keys(stats.stats).length === 0) {
      console.log("📭 No referrals yet")
    } else {
      Object.entries(stats.stats).forEach(([status, data]: [string, any]) => {
        console.log(`${status.toUpperCase()}: ${data.count} referrals, ${data.rewards} XP earned`)
      })
    }

    console.log(`\n📋 Recent Referrals (${stats.recentReferrals.length} total):`)
    if (stats.recentReferrals.length === 0) {
      console.log("📭 No referrals found")
    } else {
      stats.recentReferrals.forEach((referral: any, index: number) => {
        console.log(`${index + 1}. ${referral.referred.displayName || referral.referred.username} (@${referral.referred.username})`)
        console.log(`   Status: ${referral.status}`)
        console.log(`   Created: ${new Date(referral.createdAt).toLocaleDateString()}`)
        if (referral.completedAt) {
          console.log(`   Completed: ${new Date(referral.completedAt).toLocaleDateString()}`)
        }
        console.log(`   Reward: ${referral.referrerReward} XP`)
        console.log("")
      })
    }

    // Show referral link
    console.log("🔗 Your Referral Link:")
    console.log(`https://yourapp.com/auth/signup?ref=${myUser.referralCode}`)
    
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    process.exit(0)
  }
}

checkMyReferrals()