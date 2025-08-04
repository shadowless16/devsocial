// api/user/follow/[userId]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import Notification from "@/models/Notification"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { awardXP } from "@/utils/awardXP" // Assuming awardXP is defined to accept (userId, reason, amount)

// POST /api/user/follow/[userId] - Follow a user
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (authResult.error) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status })
    }

    const { userId } = params
    const currentUserId = authResult.user!.id

    if (userId === currentUserId) {
      return NextResponse.json(errorResponse("Cannot follow yourself"), { status: 400 })
    }

    const userToFollow = await User.findById(userId)
    if (!userToFollow) {
      return NextResponse.json(errorResponse("User not found"), { status: 404 })
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userId,
    })

    if (existingFollow) {
      return NextResponse.json(errorResponse("Already following this user"), { status: 400 })
    }

    const follow = await Follow.create({
      follower: currentUserId,
      following: userId,
    })

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } })

    await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "follow",
      title: "New Follower",
      message: `${authResult.user!.username} started following you`,
    })

    // Corrected awardXP call: (userId, reason, amount)
    await awardXP(currentUserId, "follow_user", 5) // XP reason string, then XP amount

    return NextResponse.json(successResponse({ follow }))
  } catch (error) {
    console.error("Follow user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}

// DELETE /api/user/follow/[userId] - Unfollow a user
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (authResult.error) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status })
    }

    const { userId } = params
    const currentUserId = authResult.user!.id

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    })

    if (!follow) {
      return NextResponse.json(errorResponse("Not following this user"), { status: 400 })
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } })
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } })

    return NextResponse.json(successResponse({ message: "Unfollowed successfully" }))
  } catch (error) {
    console.error("Unfollow user error:", error)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}