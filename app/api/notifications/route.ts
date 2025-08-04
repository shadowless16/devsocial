import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Notification from "@/models/Notification"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unread") === "true"
    const skip = (page - 1) * limit

    const filter: any = { recipient: userId }
    if (unreadOnly) {
      filter.isRead = false
    }

    const notifications = await Notification.find(filter)
      .populate("sender", "username displayName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalNotifications = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    })

    return NextResponse.json(
      successResponse({
        notifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          hasMore: skip + notifications.length < totalNotifications,
        },
      }),
    )
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(errorResponse("Failed to fetch notifications"), { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const { notificationIds, markAsRead } = await request.json()

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(errorResponse("Invalid notification IDs"), { status: 400 })
    }

    const updateData: any = {}
    if (markAsRead !== undefined) {
      updateData.isRead = markAsRead
      if (markAsRead) {
        updateData.readAt = new Date()
      }
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: userId,
      },
      updateData,
    )

    return NextResponse.json(
      successResponse({
        message: `${notificationIds.length} notifications updated`,
      }),
    )
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(errorResponse("Failed to update notifications"), { status: 500 })
  }
}
