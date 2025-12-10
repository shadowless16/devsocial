import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { authMiddleware, type AuthResult } from "@/middleware/auth"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"


export async function GET(request: NextRequest) {
  try {
    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
    }

    const userId = authResult.user!.id
    const stats = await ReferralSystemFixed.getReferralStats(userId)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching referral stats:", errorMessage)
    return NextResponse.json({ success: false, message: "Failed to fetch referral stats" }, { status: 500 })
  }
}
