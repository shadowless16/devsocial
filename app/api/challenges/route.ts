import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { ChallengeSystem } from "@/utils/challenge-system"
import { successResponse, errorResponse } from "@/utils/response"


export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(__request: NextRequest) {
  try {
    const challenges = await ChallengeSystem.getActiveChallenges()
    return NextResponse.json(successResponse({ challenges }))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching challenges:", errorMessage)
    return NextResponse.json(errorResponse("Failed to fetch challenges"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    // Only admins can create challenges
    if (authResult.user!.role !== "admin") {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 403 })
    }

    const challengeData = await request.json()
    const challenge = await ChallengeSystem.createWeeklyChallenge(challengeData, authResult.user!.id)

    return NextResponse.json(successResponse({ challenge }), { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error creating challenge:", errorMessage)
    return NextResponse.json(errorResponse("Failed to create challenge"), { status: 500 })
  }
}
