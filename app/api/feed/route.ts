import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { FeedAlgorithm } from "@/utils/feed-algorithm"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const algorithm =
      (searchParams.get("algorithm") as "chronological" | "engagement" | "personalized") || "personalized"

    const feedData = await FeedAlgorithm.generateFeed({
      userId: authResult.user.id,
      page,
      limit,
      algorithm,
    })

    return NextResponse.json(successResponse(feedData))
  } catch (error) {
    console.error("Feed generation error:", error)
    return NextResponse.json(errorResponse("Failed to generate feed"), { status: 500 })
  }
}

// POST /api/feed/interaction - Track user interactions for algorithm improvement
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const body = await request.json()
    const { type, postId, duration } = body

    await FeedAlgorithm.updateUserPreferences(authResult.user.id, {
      type,
      postId,
      duration,
    })

    return NextResponse.json(successResponse({ message: "Interaction recorded" }))
  } catch (error) {
    console.error("Interaction tracking error:", error)
    return NextResponse.json(errorResponse("Failed to track interaction"), { status: 500 })
  }
}
