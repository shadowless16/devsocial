import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserProfile from "@/models/UserProfile"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let userProfile = await UserProfile.findOne({ user: session.user.id })
    
    // Create default profile if doesn't exist
    if (!userProfile) {
      userProfile = await UserProfile.create({
        user: session.user.id,
        techStack: user.techStack || [],
        socialLinks: [
          user.githubUsername ? { platform: "GitHub", url: `https://github.com/${user.githubUsername}` } : null,
          user.linkedinUrl ? { platform: "LinkedIn", url: user.linkedinUrl } : null,
          user.portfolioUrl ? { platform: "Portfolio", url: user.portfolioUrl } : null
        ].filter(Boolean),
        skills: [],
        privacySettings: {
          profileVisibility: true,
          showEmail: false,
          showLocation: true,
          showActivity: true,
          allowMessages: true,
          showStats: true
        }
      })
    }

    const profileData = {
      name: user.displayName || user.username,
      title: userProfile.title || "Developer",
      location: userProfile.location || user.location,
      joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      bio: userProfile.bio || user.bio,
      avatar: user.avatar,
      techStack: userProfile.techStack,
      socialLinks: userProfile.socialLinks,
      skills: userProfile.skills,
      privacySettings: userProfile.privacySettings
    }

    return NextResponse.json({ profile: profileData })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, bio, location, techStack, socialLinks, skills, privacySettings } = body

    let userProfile = await UserProfile.findOne({ user: session.user.id })
    
    if (!userProfile) {
      userProfile = new UserProfile({ user: session.user.id })
    }

    // Update profile fields
    if (title !== undefined) userProfile.title = title
    if (bio !== undefined) userProfile.bio = bio
    if (location !== undefined) userProfile.location = location
    if (techStack !== undefined) userProfile.techStack = techStack
    if (socialLinks !== undefined) userProfile.socialLinks = socialLinks
    if (skills !== undefined) userProfile.skills = skills
    if (privacySettings !== undefined) userProfile.privacySettings = { ...userProfile.privacySettings, ...privacySettings }

    await userProfile.save()

    return NextResponse.json({ message: "Profile updated successfully", profile: userProfile })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}