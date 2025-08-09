import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Post from "@/models/Post"
import ChallengeParticipation from "@/models/ChallengeParticipation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    // Get user posts count
    const postsCreated = await Post.countDocuments({ author: session.user.id })

    // Get challenges completed
    const challengesCompleted = await ChallengeParticipation.countDocuments({
      user: session.user.id,
      status: "completed"
    })

    // Calculate community rank (simplified - based on points)
    const usersWithHigherPoints = await User.countDocuments({
      points: { $gt: user.points }
    })
    const communityRank = usersWithHigherPoints + 1

    const stats = {
      totalXP: user.points,
      challengesCompleted,
      communityRank,
      postsCreated
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get profile stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}