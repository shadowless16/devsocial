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
    const { amount, action } = await request.json()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (action === "add") {
      user.points += amount
    } else if (action === "remove") {
      user.points = Math.max(0, user.points - amount)
    } else if (action === "set") {
      user.points = amount
    }

    user.level = Math.floor(user.points / 100) + 1
    await user.save()

    return NextResponse.json({
      success: true,
      data: { points: user.points, level: user.level },
      message: "XP updated successfully"
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update XP" 
    }, { status: 500 })
  }
}
