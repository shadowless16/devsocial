import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { ChallengeSystem } from "@/utils/challenge-system"
import { successResponse, errorResponse } from "@/utils/response"

export async function POST(request: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { challengeId } = params
    const progressData = await request.json()

    await ChallengeSystem.updateProgress(userId, challengeId, progressData)

    return NextResponse.json(successResponse({ message: "Progress updated successfully" }))
  } catch (error) {
    console.error("Error updating challenge progress:", error)
    return NextResponse.json(errorResponse("Failed to update progress"), { status: 500 })
  }
}
