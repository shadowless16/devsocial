import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { generateGenderAvatar } from "@/utils/avatar-generator"

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { gender, userType, bio, techStack, experienceLevel, githubUsername, linkedinUrl, portfolioUrl } = body

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Update user fields
    if (gender) user.gender = gender
    if (userType) user.userType = userType
    if (bio) user.bio = bio
    if (techStack) user.techStack = techStack
    if (experienceLevel) user.experienceLevel = experienceLevel
    if (githubUsername) user.githubUsername = githubUsername
    if (linkedinUrl) user.linkedinUrl = linkedinUrl
    if (portfolioUrl) user.portfolioUrl = portfolioUrl

    // Generate gender-specific avatar if gender is provided
    if (gender && !user.avatar.includes('uploaded')) {
      user.avatar = generateGenderAvatar(user.username, gender)
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true

    await user.save()

    return NextResponse.json({
      success: true,
      data: { user: user.toObject() }
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}