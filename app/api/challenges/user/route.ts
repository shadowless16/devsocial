import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { authMiddleware } from "@/middleware/auth"
import { ChallengeSystem } from "@/utils/challenge-system"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const challenges = await ChallengeSystem.getUserChallenges(userId)

    return NextResponse.json(successResponse({ challenges }))
  } catch (error) {
    console.error("Error fetching user challenges:", error)
    return NextResponse.json(errorResponse("Failed to fetch user challenges"), { status: 500 })
  }
}
