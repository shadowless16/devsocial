import Referral from "../models/Referral"
import User from "../models/User"
import UserStats from "../models/UserStats"
import { awardXP } from "./awardXP"
import { connectDB } from "../config/database"

export class ReferralSystem {
  static async getReferralCode(userId: string): Promise<string> {
    const user = await User.findById(userId) as typeof User.prototype | null
    if (!user) throw new Error("User not found")

    // Return the user's existing referral code
    if (!user.referralCode) {
      // Generate one if somehow missing (shouldn't happen with pre-save hook)
      const timestamp = Date.now().toString(36)
      const username = user.username.substring(0, 4).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      user.referralCode = `${username}${timestamp}${random}`
      await user.save()
    }

    return user.referralCode
  }

  static async createReferral(referrerId: string, referredUserId: string): Promise<unknown> {
    // connectDB() // Remove in tests, connection already exists

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referrer: referrerId,
      referred: referredUserId,
    } as any)

    if (existingReferral) {
      throw new Error("Referral already exists")
    }

    // Get referrer's code for tracking
    const referralCode = await this.getReferralCode(referrerId)

    // Create referral with 30-day expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const referral = new Referral({
      referrer: referrerId,
      referred: referredUserId,
      referralCode,
      expiresAt,
      status: "pending",
    })

    await referral.save()
    return referral
  }

  static async checkReferralCompletion(userId: string): Promise<void> {
    // connectDB() // Remove in tests, connection already exists

    // Find pending referrals for this user
    const pendingReferrals = await Referral.find({
      referred: userId,
      status: "pending",
      expiresAt: { $gt: new Date() }, // Only check non-expired referrals
    } as any)

    for (const referral of pendingReferrals) {
      try {
        const user = await User.findById(userId) as typeof User.prototype | null
        if (!user) continue

        // Ensure UserStats exists
        let userStats = await UserStats.findOne({ user: userId } as any)
        if (!userStats) {
          userStats = await UserStats.create({
            user: userId,
            totalPosts: 0,
            totalXP: user.points || 0,
            totalReferrals: 0
          })
        }

        // Check completion criteria: user has at least 1 post and 50 XP
        const hasMinimumActivity = userStats.totalPosts >= 1 && userStats.totalXP >= 50

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
        }
      } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error(`Error processing referral completion for ${userId}:`, errorMessage)
        // Continue with other referrals
      }
    }
  }

  static async getReferralStats(userId: string): Promise<unknown> {
    // connectDB() // Remove in tests, connection already exists

    // First, check for any pending referrals that should be completed
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

    const recentReferrals = await Referral.find({ referrer: userObjectId } as any)
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
    // connectDB() // Remove in tests, connection already exists

    await Referral.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: new Date() },
      },
      { status: "expired" },
    )
  }

  static async checkUserReferrals(referrerId: string): Promise<void> {
    // connectDB() // Remove in tests, connection already exists

    // Find pending referrals for this referrer
    const pendingReferrals = await Referral.find({
      referrer: referrerId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    } as any).populate("referred", "_id")

    for (const referral of pendingReferrals) {
      try {
        const referredUser = await User.findById(referral.referred._id) as typeof User.prototype | null
        if (!referredUser) continue

        // Ensure UserStats exists
        let userStats = await UserStats.findOne({ user: referral.referred._id } as any)
        if (!userStats) {
          userStats = await UserStats.create({
            user: referral.referred._id,
            totalPosts: 0,
            totalXP: referredUser.points || 0,
            totalReferrals: 0
          })
        }

        // Check completion criteria: at least 1 post and 50 XP
        if (userStats.totalPosts >= 1 && userStats.totalXP >= 50) {
          // Update referral status
          referral.status = "completed"
          referral.completedAt = new Date()
          referral.rewardsClaimed = true
          await referral.save()

          // Award XP to both users
          await awardXP(referral.referrer.toString(), "referral_success", referral._id.toString())
          await awardXP(referral.referred._id.toString(), "referral_bonus", referral._id.toString())

          // Update referrer's total referrals count
          await UserStats.findOneAndUpdate(
            { user: referral.referrer },
            { $inc: { totalReferrals: 1 } },
            { upsert: true }
          )
        }
      } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error(`Error processing referral ${referral._id}:`, errorMessage)
      }
    }
  }
}
