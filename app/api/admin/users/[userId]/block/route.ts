import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    const { userId } = await params

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    user.isBlocked = !user.isBlocked
    await user.save()

    return NextResponse.json({
      success: true,
      data: { isBlocked: user.isBlocked },
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
    })
  } catch (error: any) {
    console.error("Block user error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to block user" 
    }, { status: 500 })
  }
}
