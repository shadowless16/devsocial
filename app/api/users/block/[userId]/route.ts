import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Block from "@/models/Block"
import Follow from "@/models/Follow"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

// POST /api/user/block/[userId] - Block a user

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const { userId } = params
    const currentUserId = authResult.user.id

    if (userId === currentUserId) {
      return NextResponse.json(errorResponse("Cannot block yourself"), { status: 400 })
    }

    // Check if user exists
    const userToBlock = await User.findById(userId)
    if (!userToBlock) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    // Check if already blocked
    const existingBlock = await Block.findOne({
      blocker: currentUserId,
      blocked: userId,
    })

    if (existingBlock) {
      return NextResponse.json(errorResponse("User already blocked"), { status: 400 })
    }

    // Create block relationship
    const block = await Block.create({
      blocker: currentUserId,
      blocked: userId,
    })

    // Remove any existing follow relationships
    await Follow.deleteMany({
      $or: [
        { follower: currentUserId, following: userId },
        { follower: userId, following: currentUserId },
      ],
    })

    // Update follower/following counts
    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } })

    return NextResponse.json(successResponse({ block }))
  } catch (error) {
    console.error("Block user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}

// DELETE /api/user/block/[userId] - Unblock a user
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status || 401 })
    }

    const { userId } = params
    const currentUserId = authResult.user.id

    // Find and delete block relationship
    const block = await Block.findOneAndDelete({
      blocker: currentUserId,
      blocked: userId,
    })

    if (!block) {
      return NextResponse.json(errorResponse("User not blocked"), { status: 400 })
    }

    return NextResponse.json(successResponse({ message: "User unblocked successfully" }))
  } catch (error) {
    console.error("Unblock user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}
