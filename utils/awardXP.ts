import User from "@/models/User"
import XPLog from "@/models/XPLog"
import connectDB from "@/lib/core/db"
import { ReferralSystemFixed } from "./referral-system-fixed"
import { checkDailyLimit } from "./check-daily-limit"

// XP values for different actions
export const XP_VALUES = {
  daily_login: 10,
  post_creation: 20,
  comment_creation: 2.5,
  like_given: 1.5,  // Small XP for likes to prevent spam
  like_received: 3,  // Slightly more XP when receiving likes
  first_post: 50,
  first_comment: 25,
  poll_interaction: 5,
  badge_earned: 100,
  level_up: 200,
  moderator_action_bonus: 50,
  referral_success: 100,  // XP for successful referral (referrer)
  referral_bonus: 15,    // XP for being referred (new user)
  email_verified: 10,
  user_followed: 5,
  challenge_completion: 75,
  daily_challenge: 50,  // Default value, can be overridden
  quality_content: 0,  // AI-determined bonus (0-50 XP based on quality)
}

export async function awardXP(
  userId: string,
  type: keyof typeof XP_VALUES,
  refId?: string,
  customXP?: number,
): Promise<{ success: boolean; newLevel?: number; levelUp?: boolean; limitReached?: boolean }> {
  try {
    // await connectDB() // Remove in tests, connection already exists

    const xpAmount = customXP || XP_VALUES[type]
    if (!xpAmount) {
      throw new Error(`Invalid XP type: ${type}`)
    }

    // Check daily limit for post_creation
    if (type === 'post_creation') {
      const limitCheck = await checkDailyLimit(userId, 'post_created');
      if (!limitCheck.allowed) {
        console.log(`Daily limit reached for ${type}: ${limitCheck.count}/${limitCheck.limit}`);
        return { success: false, limitReached: true };
      }
    }

    // Create XP log entry
    await XPLog.create({
      userId,
      type,
      xpAmount,
      refId: refId || undefined,
    })

    // Update user points
    const user = await User.findById(userId) as typeof User.prototype | null
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
        await ReferralSystemFixed.checkReferralCompletion(userId)
      } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error checking referral completion:", errorMessage)
        // Don't fail the XP award if referral check fails
      }
    }

    return {
      success: true,
      newLevel: user.level,
      levelUp,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error awarding XP:", errorMessage)
    return { success: false }
  }
}

export async function checkFirstTimeAction(userId: string, type: "post" | "comment"): Promise<boolean> {
  try {
    // await connectDB() // Remove in tests, connection already exists

    const logType = type === "post" ? "first_post" : "first_comment"
    const existingLog = await XPLog.findOne({ userId, type: logType } as any)

    return !existingLog
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error checking first time action:", errorMessage)
    return false
  }
}
