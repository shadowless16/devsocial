import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { successResponse, errorResponse } from "@/utils/response"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()
    console.log("[Onboarding API] Received data:", body)

    const {
      bio,
      techCareerPath,
      experienceLevel,
      techStack,
      githubUsername,
      linkedinUrl,
      portfolioUrl,
      interests,
      starterBadge,
      socials
    } = body

    // Update user with onboarding data
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          bio: bio || "",
          techCareerPath: techCareerPath || "",
          experienceLevel: experienceLevel || "beginner",
          techStack: techStack || [],
          githubUsername: githubUsername || "",
          linkedinUrl: linkedinUrl || "",
          portfolioUrl: portfolioUrl || "",
          // Add starter badge to badges array if not already present
          ...(starterBadge && { $addToSet: { badges: starterBadge } }),
          // Mark onboarding as completed
          onboardingCompleted: true,
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    if (!updatedUser) {
      return errorResponse("User not found", 404)
    }

    console.log("[Onboarding API] User updated successfully")

    return NextResponse.json(
      successResponse({
        message: "Onboarding completed successfully",
        user: {
          id: updatedUser._id,
          bio: updatedUser.bio,
          techCareerPath: updatedUser.techCareerPath,
          experienceLevel: updatedUser.experienceLevel,
          techStack: updatedUser.techStack,
          githubUsername: updatedUser.githubUsername,
          linkedinUrl: updatedUser.linkedinUrl,
          portfolioUrl: updatedUser.portfolioUrl,
          badges: updatedUser.badges,
          onboardingCompleted: updatedUser.onboardingCompleted
        }
      })
    )
  } catch (error) {
    console.error("Onboarding error:", error)
    return errorResponse("Internal server error", 500)
  }
}
