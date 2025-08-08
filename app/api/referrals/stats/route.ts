import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { authMiddleware } from "@/middleware/auth"
import { ReferralSystem } from "@/utils/referral-system"


export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error || 'Authentication failed' }, { status: 401 })
    }

    const userId = authResult.user!.id
    const stats = await ReferralSystem.getReferralStats(userId)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch referral stats" }, { status: 500 })
  }
}
