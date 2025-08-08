import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ChallengeRecommender } from "@/utils/challenge-recommender"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const recommendedChallenges = await ChallengeRecommender.getRecommendedChallenges(
      session.user.id,
      limit
    )

    return NextResponse.json({ 
      challenges: recommendedChallenges,
      message: recommendedChallenges.length > 0 
        ? "Challenges personalized for you" 
        : "No personalized challenges available"
    })
  } catch (error) {
    console.error("Get recommended challenges error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}