import type { NextRequest } from "next/server"
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import { AuthService } from "@/lib/auth/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse("Invalid email address", 400)
    }

    const { email } = validation.data

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists or not
      return successResponse({
        message: "If an account with that email exists, we've sent a password reset link.",
      })
    }

    // Generate reset token
    const resetToken = AuthService.generateResetToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetExpires
    await user.save()

    // Send reset email
    await AuthService.sendPasswordResetEmail(user.email, resetToken, user.username)

    return successResponse({
      message: "If an account with that email exists, we've sent a password reset link.",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Forgot password error:", errorMessage)
    return errorResponse("Failed to process request", 500)
  }
}
