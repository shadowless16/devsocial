import { NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from "@/lib/auth/auth"
import { ChallengeRecommender } from "@/utils/challenge-recommender"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Get recommended challenges error:", errorMessage)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
