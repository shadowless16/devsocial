import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import { ReferralSystem } from "@/utils/referral-system"
import { successResponse, errorResponse } from "@/utils/response"

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const { referredUserId } = await request.json()

    if (!referredUserId) {
      return NextResponse.json(errorResponse("Referred user ID is required"), { status: 400 })
    }

    if (userId === referredUserId) {
      return NextResponse.json(errorResponse("Cannot refer yourself"), { status: 400 })
    }

    const referral = await ReferralSystem.createReferral(userId, referredUserId)

    return NextResponse.json(successResponse({ referral }), { status: 201 })
  } catch (error: any) {
    console.error("Error creating referral:", error)
    return NextResponse.json(errorResponse(error.message || "Failed to create referral"), { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const referralCode = await ReferralSystem.getReferralCode(userId)

    return NextResponse.json(successResponse({ referralCode }))
  } catch (error) {
    console.error("Error generating referral code:", error)
    return NextResponse.json(errorResponse("Failed to generate referral code"), { status: 500 })
  }
}
