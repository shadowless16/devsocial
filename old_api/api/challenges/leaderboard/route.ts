import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { ChallengeSystem } from "@/utils/challenge-system"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get("challengeId")

    if (!challengeId) {
      return NextResponse.json(errorResponse("Challenge ID is required"), { status: 400 })
    }

    const leaderboard = await ChallengeSystem.getChallengeLeaderboard(challengeId)

    return NextResponse.json(successResponse({ leaderboard }))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching challenge leaderboard:", errorMessage)
    return NextResponse.json(errorResponse("Failed to fetch leaderboard"), { status: 500 })
  }
}
