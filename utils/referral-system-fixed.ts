import Referral from "@/models/Referral"
import User from "@/models/User"
import UserStats from "@/models/UserStats"
import { awardXP } from "./awardXP"
import connectDB from "@/lib/db"

export class ReferralSystemFixed {
  static async getReferralCode(userId: string): Promise<string> {
    await connectDB()
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    if (!user.referralCode) {
      const timestamp = Date.now().toString(36)
      const username = user.username.substring(0, 4).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      user.referralCode = `${username}${timestamp}${random}`
      await user.save()
    }

    return user.referralCode
  }

  static async validateReferralCode(referralCode: string): Promise<{ valid: boolean; referrer?: any }> {
    await connectDB()
    
    if (!referralCode || referralCode.trim() === '') {
      return { valid: false }
    }

    const referrer = await User.findOne({ referralCode: referralCode.trim() })
    return { 
      valid: !!referrer, 
      referrer: referrer ? { id: referrer._id.toString(), username: referrer.username } : undefined 
    }
  }

  static async createReferral(referrerId: string, referredUserId: string, referralCode?: string): Promise<any> {
    await connectDB()

    // Prevent self-referral
    if (referrerId === referredUserId) {
      throw new Error("Cannot refer yourself")
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      $or: [
        { referrer: referrerId, referred: referredUserId },
        { referred: referredUserId } // Prevent multiple referrals for same user
      ]
    })

    if (existingReferral) {
      throw new Error("Referral already exists for this user")
    }

    // Use provided code or get referrer's code
    const finalReferralCode = referralCode || await this.getReferralCode(referrerId)

    // Create referral with 30-day expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const referral = new Referral({
      referrer: referrerId,
      referred: referredUserId,
      referralCode: finalReferralCode,
      expiresAt,
      status: "pending",
    })

    await referral.save()
    
    // Immediately check if the referred user already meets completion criteria
    await this.checkReferralCompletion(referredUserId)
    
    return referral
  }

  static async checkReferralCompletion(userId: string): Promise<void> {
    await connectDB()

    const pendingReferrals = await Referral.find({
      referred: userId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })

    for (const referral of pendingReferrals) {
      try {
        const user = await User.findById(userId)
        if (!user) continue

        // Ensure UserStats exists
        let userStats = await UserStats.findOne({ user: userId })
        if (!userStats) {
          userStats = await UserStats.create({
            user: userId,
            totalPosts: 0,
            totalXP: user.points || 0,
            totalReferrals: 0
          })
        }

        // More lenient completion criteria: user has at least 25 XP (reduced from 50)
        const hasMinimumActivity = userStats.totalXP >= 25

        if (hasMinimumActivity) {
          // Mark referral as completed
          referral.status = "completed"
          referral.completedAt = new Date()
          referral.rewardsClaimed = true
          await referral.save()

          // Award XP to both users
          await awardXP(referral.referrer.toString(), "referral_success", referral._id.toString())
          await awardXP(userId, "referral_bonus", referral._id.toString())

          // Update referral stats
          await UserStats.findOneAndUpdate(
            { user: referral.referrer }, 
            { $inc: { totalReferrals: 1 } }, 
            { upsert: true }
          )

          console.log(`Referral completed: ${referral._id}`)
        }
      } catch (error) {
        console.error(`Error processing referral completion for ${userId}:`, error)
      }
    }
  }

  static async processReferralFromSignup(referralCode: string, newUserId: string): Promise<boolean> {
    try {
      await connectDB()
      
      const validation = await this.validateReferralCode(referralCode)
      if (!validation.valid || !validation.referrer) {
        console.log(`Invalid referral code: ${referralCode}`)
        return false
      }

      // Create the referral
      await this.createReferral(validation.referrer.id, newUserId, referralCode)
      console.log(`Referral created: ${validation.referrer.username} -> new user ${newUserId}`)
      return true
    } catch (error) {
      console.error("Error processing referral from signup:", error)
      return false
    }
  }

  static async getReferralStats(userId: string): Promise<any> {
    await connectDB()

    // Check for any pending referrals that should be completed
    await this.checkUserReferrals(userId)

    const userObjectId = new User.base.Types.ObjectId(userId)
    const stats = await Referral.aggregate([
      { $match: { referrer: userObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRewards: { $sum: "$referrerReward" },
        },
      },
    ])

    const recentReferrals = await Referral.find({ referrer: userObjectId })
      .populate("referred", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(10)

    return {
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, rewards: stat.totalRewards }
        return acc
      }, {}),
      recentReferrals,
    }
  }

  static async expireOldReferrals(): Promise<void> {
    await connectDB()

    const result = await Referral.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: new Date() },
      },
      { status: "expired" },
    )

    console.log(`Expired ${result.modifiedCount} old referrals`)
  }

  static async checkUserReferrals(referrerId: string): Promise<void> {
    await connectDB()

    const pendingReferrals = await Referral.find({
      referrer: referrerId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("referred", "_id")

    for (const referral of pendingReferrals) {
      try {
        const referredUser = await User.findById(referral.referred._id)
        if (!referredUser) continue

        let userStats = await UserStats.findOne({ user: referral.referred._id })
        if (!userStats) {
          userStats = await UserStats.create({
            user: referral.referred._id,
            totalPosts: 0,
            totalXP: referredUser.points || 0,
            totalReferrals: 0
          })
        }

        // Check completion criteria: at least 25 XP
        if (userStats.totalXP >= 25) {
          referral.status = "completed"
          referral.completedAt = new Date()
          referral.rewardsClaimed = true
          await referral.save()

          await awardXP(referral.referrer.toString(), "referral_success", referral._id.toString())
          await awardXP(referral.referred._id.toString(), "referral_bonus", referral._id.toString())

          await UserStats.findOneAndUpdate(
            { user: referral.referrer },
            { $inc: { totalReferrals: 1 } },
            { upsert: true }
          )
        }
      } catch (error) {
        console.error(`Error processing referral ${referral._id}:`, error)
      }
    }
  }

  static async debugReferralSystem(): Promise<any> {
    await connectDB()
    
    const totalReferrals = await Referral.countDocuments()
    const pendingReferrals = await Referral.countDocuments({ status: "pending" })
    const completedReferrals = await Referral.countDocuments({ status: "completed" })
    const expiredReferrals = await Referral.countDocuments({ status: "expired" })
    
    const recentReferrals = await Referral.find()
      .populate("referrer", "username")
      .populate("referred", "username")
      .sort({ createdAt: -1 })
      .limit(10)
    
    return {
      summary: {
        total: totalReferrals,
        pending: pendingReferrals,
        completed: completedReferrals,
        expired: expiredReferrals
      },
      recentReferrals: recentReferrals.map(r => ({
        id: r._id,
        referrer: r.referrer?.username || 'Unknown',
        referred: r.referred?.username || 'Unknown',
        status: r.status,
        code: r.referralCode,
        createdAt: r.createdAt,
        completedAt: r.completedAt
      }))
    }
  }
}