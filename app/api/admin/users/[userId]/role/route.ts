import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import connectDB from "@/lib/core/db"
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from "@/lib/auth/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { userId } = await params
    const { role } = await request.json()

    if (!["user", "moderator", "admin"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { role: user.role },
      message: "User role updated successfully"
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update role" 
    }, { status: 500 })
  }
}
