import { NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from "@/lib/auth/auth"
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import { generateGenderAvatar } from "@/utils/avatar-generator"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return existing onboarding data
    return NextResponse.json({
      avatar: user.avatar || "",
      bio: user.bio || "",
      gender: user.gender || "",
      userType: user.userType || "",
      socials: user.socials || { twitter: "", linkedin: "" },
      techCareerPath: user.techCareerPath || "",
      experienceLevel: user.experienceLevel || "beginner",
      techStack: user.techStack || [],
      githubUsername: user.githubUsername || "",
      linkedinUrl: user.linkedinUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      interests: user.interests || [],
      starterBadge: user.starterBadge || "",
      xp: user.xp || 10,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Get onboarding error:", errorMessage)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    
    const session = await getSession(req)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { gender, userType, bio, techStack, experienceLevel, githubUsername, linkedinUrl, portfolioUrl, avatar, interests, starterBadge, techCareerPath, socials } = body

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
    if (interests) user.interests = interests
    if (starterBadge) user.starterBadge = starterBadge
    if (techCareerPath) user.techCareerPath = techCareerPath
    if (socials) user.socials = socials

    // Update avatar if provided (from RPM), otherwise generate gender-specific avatar
    if (avatar) {
      user.avatar = avatar
    } else if (gender && !user.avatar.includes('readyplayer.me')) {
      user.avatar = generateGenderAvatar(gender)
    }

    // Mark onboarding as completed
    user.onboardingCompleted = true

    await user.save()

    return NextResponse.json({
      success: true,
      data: { user: user.toObject() }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Onboarding error:", errorMessage)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
