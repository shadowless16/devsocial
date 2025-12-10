import { type NextRequest, NextResponse } from "next/server"
import { getSession } from '@/lib/auth/server-auth'
import User from "@/models/User"
import Post from "@/models/Post"
import connectDB from "@/lib/core/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    interface UserQuery {
      isBlocked?: boolean;
      role?: string;
    }
    
    const query: UserQuery = {}
    if (filter === "blocked") query.isBlocked = true
    if (filter === "active") query.isBlocked = false
    if (filter === "moderators") query.role = "moderator"

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("username displayName email avatar level points role isBlocked createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ])

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
      data: { 
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Admin users fetch error:", errorMessage)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch users" 
    }, { status: 500 })
  }
}
