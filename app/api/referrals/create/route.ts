import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware, type AuthResult } from "@/middleware/auth"
import { ReferralSystemFixed } from "@/utils/referral-system-fixed"



export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
    }

    const userId = authResult.user!.id
    const { referredUserId, referralCode } = await request.json()

    if (!referredUserId) {
      return NextResponse.json({ success: false, message: "Referred user ID is required" }, { status: 400 })
    }

    if (!referralCode) {
      return NextResponse.json({ success: false, message: "Referral code is required" }, { status: 400 })
    }

    if (userId === referredUserId) {
      return NextResponse.json({ success: false, message: "Cannot refer yourself" }, { status: 400 })
    }

    const referral = await ReferralSystemFixed.createReferral(userId, referredUserId, referralCode)

    return NextResponse.json({ success: true, data: { referral } }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error creating referral:", errorMessage)
    return NextResponse.json({ success: false, message: error.message || "Failed to create referral" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
    }

    const userId = authResult.user!.id
    const referralCode = await ReferralSystemFixed.getReferralCode(userId)

    return NextResponse.json({ success: true, data: { referralCode } })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error generating referral code:", errorMessage)
    return NextResponse.json({ success: false, message: "Failed to generate referral code" }, { status: 500 })
  }
}
