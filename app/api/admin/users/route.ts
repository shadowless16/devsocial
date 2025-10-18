import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"

    let query: any = {}
    if (filter === "blocked") query.isBlocked = true
    if (filter === "active") query.isBlocked = false
    if (filter === "moderators") query.role = "moderator"

    const users = await User.find(query)
      .select("username displayName email avatar level points role isBlocked createdAt")
      .sort({ createdAt: -1 })
      .limit(100)

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id })
        return {
          ...user.toObject(),
          postsCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: { users: usersWithStats }
    })
  } catch (error: any) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch users" 
    }, { status: 500 })
  }
}
