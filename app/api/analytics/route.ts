import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import Post from "@/models/Post"
import Activity from "@/models/Activity"
import { authMiddleware, authorizeRoles } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: authResult.status || 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"
    const userId = searchParams.get("userId") // For user-specific analytics
    const isAdmin = authorizeRoles(["admin", "moderator"])(authResult.user.role || '')

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const dateFilter = { createdAt: { $gte: startDate } }

    // Base filter - if not admin, only show own analytics
    const userFilter = isAdmin && userId ? { author: userId } : !isAdmin ? { author: authResult.user.id } : {}

    // User Analytics
    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          avgLevel: { $avg: "$level" },
          totalPoints: { $sum: "$points" },
          activeUsers: {
            $sum: {
              $cond: [{ $gte: ["$lastActive", startDate] }, 1, 0],
            },
          },
        },
      },
    ])

    // Post Analytics
    const postStats = await Post.aggregate([
      { $match: { ...dateFilter, ...userFilter } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalComments: { $sum: "$commentsCount" },
          avgLikesPerPost: { $avg: "$likesCount" },
          avgCommentsPerPost: { $avg: "$commentsCount" },
          totalXPAwarded: { $sum: "$xpAwarded" },
        },
      },
    ])

    // Engagement Analytics
    const engagementStats = await Activity.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ])

    // Top Tags
    const topTags = await Post.aggregate([
      { $match: { ...dateFilter, ...userFilter } },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalComments: { $sum: "$commentsCount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Daily Activity (for charts)
    const dailyActivity = await Post.aggregate([
      { $match: { ...dateFilter, ...userFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          posts: { $sum: 1 },
          likes: { $sum: "$likesCount" },
          comments: { $sum: "$commentsCount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Top Performers (if admin)
    let topPerformers = []
    if (isAdmin) {
      topPerformers = await User.aggregate([
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "author",
            as: "posts",
            pipeline: [{ $match: dateFilter }, { $project: { likesCount: 1, commentsCount: 1, xpAwarded: 1 } }],
          },
        },
        {
          $addFields: {
            totalEngagement: {
              $sum: {
                $map: {
                  input: "$posts",
                  as: "post",
                  in: { $add: ["$$post.likesCount", "$$post.commentsCount"] },
                },
              },
            },
            totalXP: {
              $sum: {
                $map: {
                  input: "$posts",
                  as: "post",
                  in: "$$post.xpAwarded",
                },
              },
            },
            postCount: { $size: "$posts" },
          },
        },
        { $match: { postCount: { $gt: 0 } } },
        { $sort: { totalEngagement: -1 } },
        { $limit: 10 },
        {
          $project: {
            username: 1,
            displayName: 1,
            avatar: 1,
            level: 1,
            totalEngagement: 1,
            totalXP: 1,
            postCount: 1,
          },
        },
      ])
    }

    const analytics = {
      period,
      dateRange: { start: startDate, end: now },
      userStats: userStats[0] || {
        totalUsers: 0,
        avgLevel: 0,
        totalPoints: 0,
        activeUsers: 0,
      },
      postStats: postStats[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        avgLikesPerPost: 0,
        avgCommentsPerPost: 0,
        totalXPAwarded: 0,
      },
      engagementStats,
      topTags,
      dailyActivity,
      topPerformers: isAdmin ? topPerformers : [],
    }

    return NextResponse.json(successResponse(analytics))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Analytics error:", errorMessage)
    return NextResponse.json(errorResponse("Failed to fetch analytics"), { status: 500 })
  }
}
