import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Notification from "@/models/Notification"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id

    const result = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    )

    return NextResponse.json(
      successResponse({
        message: `${result.modifiedCount} notifications marked as read`,
      }),
    )
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(errorResponse("Failed to mark notifications as read"), { status: 500 })
  }
}
