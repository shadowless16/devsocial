import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Referral from "@/models/Referral"
import UserStats from "@/models/UserStats"
import { awardXP } from "@/utils/awardXP"
import { ReferralSystem } from "@/utils/referral-system"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    // Optional: Check if user is admin
    // const user = await User.findById(authResult.user!.id)
    // if (user?.role !== "admin") {
    //   return NextResponse.json(errorResponse("Unauthorized"), { status: 403 })
    // }

    await connectDB()

    // Find all pending referrals
    const pendingReferrals = await Referral.find({
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("referred", "_id")

    let processedCount = 0
    let completedCount = 0
    const completedReferrals = []

    for (const referral of pendingReferrals) {
      try {
        const userStats = await UserStats.findOne({ user: referral.referred._id })

        if (!userStats) continue

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

          completedReferrals.push({
            referralId: referral._id,
            referrer: referral.referrer,
            referred: referral.referred._id,
          })

          completedCount++
        }

        processedCount++
      } catch (error) {
        console.error(`Error processing referral ${referral._id}:`, error)
      }
    }

    // Also expire old pending referrals
    await ReferralSystem.expireOldReferrals()

    return NextResponse.json(
      successResponse({
        processed: processedCount,
        completed: completedCount,
        completedReferrals,
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error("Error checking all referrals:", error)
    return NextResponse.json(
      errorResponse("Failed to check referrals"),
      { status: 500 }
    )
  }
}
