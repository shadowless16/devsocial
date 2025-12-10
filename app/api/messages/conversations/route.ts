import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Conversation from "@/models/Conversation"
import connectDB from "@/lib/core/db"
import { successResponse, errorResponse } from "@/utils/response"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const conversations = await Conversation.find({
      participants: userId,
      isArchived: false,
    })
      .populate([
        {
          path: "participants",
          select: "username displayName avatarOnline lastSeen",
          match: { _id: { $ne: userId } },
        },
        {
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "username displayName",
          },
        },
      ])
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)

    const totalConversations = await Conversation.countDocuments({
      participants: userId,
      isArchived: false,
    })

    interface Participant {
      _id: { toString: () => string };
    }
    
    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount.get(userId) || 0,
      otherParticipant: conv.participants.find((p: unknown) => (p as Participant)._id.toString() !== userId),
    }))

    return NextResponse.json(
      successResponse({
        conversations: conversationsWithUnread,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalConversations / limit),
          totalConversations,
          hasMore: skip + conversations.length < totalConversations,
        },
      }),
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error fetching conversations:", errorMessage)
    return NextResponse.json(errorResponse("Failed to fetch conversations"), { status: 500 })
  }
}
