import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    await connectDB()
    const { userId } = await params

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const [postsCount, commentsCount, recentPosts, recentActivity] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Comment.countDocuments({ author: userId }),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(5),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(10).select("content createdAt xpAwarded")
    ])

    const xpBreakdown = [
      { source: "Posts Created", count: postsCount, totalXP: postsCount * 10 },
      { source: "Comments", count: commentsCount, totalXP: commentsCount * 2 },
      { source: "Daily Login", count: user.loginStreak || 0, totalXP: (user.loginStreak || 0) * 5 }
    ]

    return NextResponse.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: { postsCount, commentsCount },
        recentPosts,
        recentActivity: recentActivity.map(p => ({
          type: "Post Created",
          description: p.content.substring(0, 100),
          timestamp: p.createdAt,
          xp: p.xpAwarded
        })),
        xpBreakdown
      }
    })
  } catch (error: any) {
    console.error("User detail fetch error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch user details" 
    }, { status: 500 })
  }
}
