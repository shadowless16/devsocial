import User from "@/models/User"
import XPLog from "@/models/XPLog"
import connectDB from "@/lib/db"
import { ReferralSystem } from "./referral-system"

// XP values for different actions
const XP_VALUES = {
  daily_login: 10,
  post_creation: 20,
  comment_creation: 5,
  like_given: 2,  // Small XP for likes to prevent spam
  like_received: 3,  // Slightly more XP when receiving likes
  first_post: 50,
  first_comment: 25,
  poll_interaction: 5,
  badge_earned: 100,
  level_up: 200,
  moderator_action_bonus: 50,
  referral_success: 25,  // XP for successful referral (referrer)
  referral_bonus: 15,    // XP for being referred (new user)
}

export async function awardXP(
  userId: string,
  type: keyof typeof XP_VALUES,
  refId?: string,
): Promise<{ success: boolean; newLevel?: number; levelUp?: boolean }> {
  try {
    await connectDB()

    const xpAmount = XP_VALUES[type]
    if (!xpAmount) {
      throw new Error(`Invalid XP type: ${type}`)
    }

    // Create XP log entry
    await XPLog.create({
      userId,
      type,
      xpAmount,
      refId: refId || undefined,
    })

    // Update user points
    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const oldLevel = user.level
    user.points += xpAmount

    // Level will be automatically calculated in the pre-save hook
    await user.save()

    const levelUp = user.level > oldLevel

    // Award additional XP for leveling up
    if (levelUp) {
      await XPLog.create({
        userId,
        type: "level_up",
        xpAmount: XP_VALUES.level_up,
      })

      user.points += XP_VALUES.level_up
      await user.save()
    }

    // Check if this XP gain completes any pending referrals
    // Don't check for referral-related XP types to avoid infinite loops
    if (type !== "referral_success" && type !== "referral_bonus") {
      try {
        await ReferralSystem.checkReferralCompletion(userId)
      } catch (error) {
        console.error("Error checking referral completion:", error)
        // Don't fail the XP award if referral check fails
      }
    }

    return {
      success: true,
      newLevel: user.level,
      levelUp,
    }
  } catch (error) {
    console.error("Error awarding XP:", error)
    return { success: false }
  }
}

export async function checkFirstTimeAction(userId: string, type: "post" | "comment"): Promise<boolean> {
  try {
    await connectDB()

    const logType = type === "post" ? "post_creation" : "comment_creation"
    const existingLog = await XPLog.findOne({ userId, type: logType })

    return !existingLog
  } catch (error) {
    console.error("Error checking first time action:", error)
    return false
  }
}
