import type { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { AuthService } from "@/lib/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse("Invalid input", 400)
    }

    const { token, password } = validation.data

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return errorResponse("Invalid or expired reset token", 400)
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(password)

    // Update user
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    user.refreshTokens = [] // Invalidate all refresh tokens
    await user.save()

    return successResponse({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return errorResponse("Failed to reset password", 500)
  }
}
