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
      {
        $addFields: {
          id: { $toString: "$_id" },
          viewsCount: { $ifNull: ["$viewsCount", 0] }
        }
      }
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

    // Calculate real stats
    const totalViews = await Post.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: null, total: { $sum: "$viewsCount" } } }
    ]);
    
    const totalEngagements = await Post.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $group: { _id: null, total: { $sum: { $add: ["$likesCount", "$commentsCount"] } } } }
    ]);
    
    const previousPeriodFilter = new Date(dateFilter);
    switch (period) {
      case "today":
        previousPeriodFilter.setDate(previousPeriodFilter.getDate() - 1);
        break;
      case "week":
        previousPeriodFilter.setDate(previousPeriodFilter.getDate() - 7);
        break;
      case "month":
        previousPeriodFilter.setMonth(previousPeriodFilter.getMonth() - 1);
        break;
    }
    
    const previousPosts = await Post.countDocuments({
      createdAt: { $gte: previousPeriodFilter, $lt: dateFilter }
    });
    
    const currentPosts = trendingPosts.length;
    const growthRate = previousPosts > 0 ? Math.round(((currentPosts - previousPosts) / previousPosts) * 100) : 100;
    
    const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };
    
    const stats = {
      hotPosts: currentPosts,
      growth: `${growthRate >= 0 ? '+' : ''}${growthRate}%`,
      totalViews: formatNumber(totalViews[0]?.total || 0),
      engagements: formatNumber(totalEngagements[0]?.total || 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        stats,
        trendingPosts,
        trendingTopics,
        risingUsers,
      }
    })
  } catch (error) {
    console.error("Error fetching trending data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch trending data" }, { status: 500 })
  }
}
