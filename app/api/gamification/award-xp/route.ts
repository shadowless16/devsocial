import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { GamificationService } from "@/utils/gamification-service"
import { successResponse, errorResponse } from "@/utils/response"


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const { action, content, refId } = await request.json()

    if (!action) {
      return NextResponse.json(errorResponse("Action is required"), { status: 400 })
    }

    const result = await GamificationService.awardXP(authResult.user!.id, action, content, refId)

    if (!result.success) {
      return NextResponse.json(errorResponse("Failed to award XP"), { status: 500 })
    }

    return NextResponse.json(successResponse(result))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error awarding XP:", errorMessage)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}
