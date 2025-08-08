// api/user/follow/[userId]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import Notification from "@/models/Notification"
import Activity from "@/models/Activity"
import { authMiddleware } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"
import { awardXP, XP_VALUES } from "@/utils/awardXP"

// POST /api/user/follow/[userId] - Follow a user

export const dynamic = 'force-dynamic'
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

    // Create a notification for the user who was followed
    await Notification.create({
      recipient: userId,
      sender: currentUserId,
      type: "follow",
      title: "New Follower",
      message: `${authResult.user!.displayName} started following you`,
    })

    // Create an activity record for the user who followed
    await Activity.create({
      user: currentUserId,
      type: "user_followed",
      description: `Started following ${userToFollow.displayName || userToFollow.username}`,
      metadata: { followedUserId: userId },
      xpEarned: XP_VALUES.user_followed,
    });

    // Award XP for following a user
    await awardXP(currentUserId, "user_followed", userId)

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

    // Prevent unfollowing AkDavid
    const userToUnfollow = await User.findById(userId)
    if (userToUnfollow?.username === "AkDavid") {
      return NextResponse.json(errorResponse("Cannot unfollow the platform creator"), { status: 403 })
    }

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