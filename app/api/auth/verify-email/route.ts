import type { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { successResponse, errorResponse } from "@/utils/response"
import { awardXP } from "@/utils/awardXP"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { token } = await request.json()

    if (!token) {
      return errorResponse("Verification token is required", 400)
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return errorResponse("Invalid or expired verification token", 400)
    }

    // Verify user
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    // Award XP for email verification
    await awardXP(user._id.toString(), "email_verification")

    return successResponse({
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return errorResponse("Failed to verify email", 500)
  }
}
