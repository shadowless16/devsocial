import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update XP" 
    }, { status: 500 })
  }
}
