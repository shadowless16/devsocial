import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"



export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error || 'Authentication failed' }, { status: 401 })
    }

    const userId = authResult.user!.id
    const { referredUserId } = await request.json()

    if (!referredUserId) {
      return NextResponse.json({ success: false, message: "Referred user ID is required" }, { status: 400 })
    }

    if (userId === referredUserId) {
      return NextResponse.json({ success: false, message: "Cannot refer yourself" }, { status: 400 })
    }

    const referral = await ReferralSystemFixed.createReferral(userId, referredUserId)

    return NextResponse.json({ success: true, data: { referral } }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating referral:", error)
    return NextResponse.json({ success: false, message: error.message || "Failed to create referral" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error || 'Authentication failed' }, { status: 401 })
    }

    const userId = authResult.user!.id
    const referralCode = await ReferralSystemFixed.getReferralCode(userId)

    return NextResponse.json({ success: true, data: { referralCode } })
  } catch (error) {
    console.error("Error generating referral code:", error)
    return NextResponse.json({ success: false, message: "Failed to generate referral code" }, { status: 500 })
  }
}
