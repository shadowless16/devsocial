import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { ChallengeSystem } from "@/utils/challenge-system"
import { successResponse, errorResponse } from "@/utils/response"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { challengeId } = await params

    const participation = await ChallengeSystem.joinChallenge(userId, challengeId)

    return NextResponse.json(successResponse({ participation }), { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error joining challenge:", errorMessage)
    return NextResponse.json(errorResponse(error.message || "Failed to join challenge"), { status: 500 })
  }
}
