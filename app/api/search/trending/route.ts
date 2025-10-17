import { type NextRequest, NextResponse } from "next/server"
import Post from "@/models/Post"
import User from "@/models/User"
import connectDB from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const trendingTags = await Post.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ])

    const popularTopics = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ])

    const suggestedUsers = await User.find()
      .select("username displayName avatar level points bio")
      .sort({ points: -1 })
      .limit(3)

    return NextResponse.json({
      success: true,
      data: {
        trending: trendingTags.map(t => t._id),
        topics: popularTopics.map(t => ({ tag: t._id, count: t.count })),
        users: suggestedUsers
      }
    })
  } catch (error: any) {
    console.error("Trending data error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch trending data" 
    }, { status: 500 })
  }
}
