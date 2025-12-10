import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import Post from "@/models/Post"
import ChallengeParticipation from "@/models/ChallengeParticipation"
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from "@/lib/auth/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Get profile stats error:", errorMessage)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
