import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { authMiddleware } from "@/middleware/auth"
import { ReferralSystem } from "@/utils/referral-system"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const stats = await ReferralSystem.getReferralStats(userId)

    return NextResponse.json(successResponse(stats))
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json(errorResponse("Failed to fetch referral stats"), { status: 500 })
  }
}
