import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Post from "@/models/Post"
import User from "@/models/User"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today"

    const dateFilter = new Date()

    switch (period) {
      case "today":
        dateFilter.setHours(0, 0, 0, 0)
        break
      case "week":
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case "month":
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
      default:
        dateFilter.setHours(0, 0, 0, 0)
    }

    // Trending posts algorithm: combination of likes, comments, and recency
    const trendingPosts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter },
        },
      },
      {
        $addFields: {
          // Calculate trending score
          trendingScore: {
            $add: [
              { $multiply: ["$likesCount", 2] }, // Likes worth 2 points
              { $multiply: ["$commentsCount", 3] }, // Comments worth 3 points
              {
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  1000 * 60 * 60, // Convert to hours and invert for recency
                ],
              },
            ],
          },
          engagementRate: {
            $multiply: [
              {
                $divide: [
                  { $add: ["$likesCount", "$commentsCount"] },
                  { $max: [{ $add: ["$likesCount", "$commentsCount", 1] }, 1] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { username: 1, displayName: 1, avatar: 1, level: 1 } }],
        },
      },
      { $unwind: "$author" },
    ])

    // Trending topics (tags)
    const trendingTopics = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          posts: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalComments: { $sum: "$commentsCount" },
        },
      },
      {
        $addFields: {
          growth: {
            $multiply: [{ $divide: ["$posts", { $max: ["$posts", 1] }] }, 100],
          },
        },
      },
      { $sort: { posts: -1 } },
      { $limit: 10 },
      {
        $project: {
          tag: "$_id",
          posts: 1,
          growth: { $concat: ["+", { $toString: { $round: ["$growth", 0] } }, "%"] },
          trend: "up",
          description: "Trending topic in the community",
        },
      },
    ])

    // Rising users (most active in the period)
    const risingUsers = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "recentPosts",
          pipeline: [
            { $match: { createdAt: { $gte: dateFilter } } },
            { $project: { likesCount: 1, commentsCount: 1 } },
          ],
        },
      },
      {
        $addFields: {
          postsThisWeek: { $size: "$recentPosts" },
          totalEngagement: {
            $sum: {
              $map: {
                input: "$recentPosts",
                as: "post",
                in: { $add: ["$$post.likesCount", "$$post.commentsCount"] },
              },
            },
          },
        },
      },
      {
        $match: {
          postsThisWeek: { $gt: 0 },
        },
      },
      {
        $addFields: {
          growthRate: {
            $concat: ["+", { $toString: { $multiply: [{ $divide: ["$postsThisWeek", 10] }, 100] } }, "%"],
          },
        },
      },
      { $sort: { totalEngagement: -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          displayName: 1,
          avatar: 1,
          level: 1,
          postsThisWeek: 1,
          totalEngagement: 1,
          growthRate: 1,
        },
      },
    ])

    // Calculate stats
    const stats = {
      hotPosts: trendingPosts.length,
      growth: "+23%", // This would be calculated based on historical data
      totalViews: "12.4K", // This would come from view tracking
      engagements: "1.8K", // This would be calculated from likes + comments
    }

    return NextResponse.json(
      successResponse({
        period,
        stats,
        trendingPosts,
        trendingTopics,
        risingUsers,
      }),
    )
  } catch (error) {
    console.error("Error fetching trending data:", error)
    return NextResponse.json(errorResponse("Failed to fetch trending data"), { status: 500 })
  }
}
