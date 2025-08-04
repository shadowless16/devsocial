import { ReferralSystem } from "./referral-system"

export async function checkReferralMiddleware(userId: string): Promise<void> {
  try {
    // Check if this user has completed any pending referrals where they are the referred user
    await ReferralSystem.checkReferralCompletion(userId)
  } catch (error) {
    // Don't throw errors - this is a background task
    console.error("Error checking referral completion:", error)
  }
}
