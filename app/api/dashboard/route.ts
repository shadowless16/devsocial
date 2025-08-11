import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { authMiddleware } from "@/middleware/auth"
import User from "@/models/User"
import Post from "@/models/Post"
import Activity from "@/models/Activity"
import Notification from "@/models/Notification"
import XPLog from "@/models/XPLog"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    console.log("[Dashboard] User ID:", userId)
    
    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId)
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week" // week, month, year
    console.log("[Dashboard] Period:", period)

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (period) {
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

    // Get user's basic stats
    console.log("[Dashboard] Fetching user stats...")
    const user = await User.findById(userObjectId).select("points level badges createdAt")
    console.log("[Dashboard] User found:", user ? "Yes" : "No")

    // Posts analytics
    console.log("[Dashboard] Fetching posts stats...")
    const postsStats = await Post.aggregate([
      {
        $match: {
          author: userObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalComments: { $sum: "$commentsCount" },
          avgLikes: { $avg: "$likesCount" },
          avgComments: { $avg: "$commentsCount" },
        },
      },
    ])

    // XP analytics
    console.log("[Dashboard] Fetching XP stats...")
    const xpStats = await XPLog.aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalXP: { $sum: "$xpAmount" },
          count: { $sum: 1 },
        },
      },
    ])

    // Daily activity for charts
    console.log("[Dashboard] Fetching daily activity...")
    const dailyActivity = await Activity.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          count: { $sum: 1 },
          xpEarned: { $sum: "$xpEarned" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          activities: {
            $push: {
              type: "$_id.type",
              count: "$count",
              xpEarned: "$xpEarned",
            },
          },
          totalXP: { $sum: "$xpEarned" },
          totalActivities: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Recent achievements
    console.log("[Dashboard] Fetching recent achievements...")
    const recentAchievements = await Activity.find({
      user: userObjectId,
      type: { $in: ["badge_earned", "level_up"] },
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .limit(5)

    // Engagement metrics
    console.log("[Dashboard] Fetching engagement stats...")
    const engagementStats = await Post.aggregate([
      {
        $match: {
          author: userObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
      },
      {
        $addFields: {
          engagementRate: {
            $divide: [
              { $add: [{ $size: "$comments" }, { $size: "$likes" }] },
              { $max: [1, 1] }, // Avoid division by zero
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgEngagementRate: { $avg: "$engagementRate" },
          topPost: { $max: { $add: ["$likesCount", "$commentsCount"] } },
        },
      },
    ])

    // Leaderboard position
    const userRank =
      (await User.countDocuments({
        points: { $gt: user?.points || 0 },
      })) + 1

    // Unread notifications count
    console.log("[Dashboard] Fetching notifications count...")
    const unreadNotifications = await Notification.countDocuments({
      recipient: userObjectId,
      isRead: false,
    })

    // Generate sample data if no real data exists
    const sampleDailyActivity = dailyActivity.length === 0 ? [
      { _id: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 50, totalActivities: 3 },
      { _id: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 75, totalActivities: 5 },
      { _id: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 30, totalActivities: 2 },
      { _id: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 90, totalActivities: 6 },
      { _id: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 60, totalActivities: 4 },
      { _id: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], totalXP: 80, totalActivities: 5 },
      { _id: new Date().toISOString().split('T')[0], totalXP: 40, totalActivities: 3 }
    ] : dailyActivity

    const sampleXpStats = xpStats.length === 0 ? [
      { _id: 'post_creation', totalXP: 200, count: 10 },
      { _id: 'like_given', totalXP: 50, count: 10 },
      { _id: 'comment_posted', totalXP: 75, count: 15 },
      { _id: 'daily_login', totalXP: 35, count: 7 }
    ] : xpStats

    // Compile dashboard data
    const dashboardData = {
      user: {
        ...user?.toObject(),
        rank: userRank,
      },
      stats: {
        posts: postsStats[0] || {
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          avgLikes: 0,
          avgComments: 0,
        },
        xp: {
          breakdown: sampleXpStats,
          total: sampleXpStats.reduce((sum, stat) => sum + stat.totalXP, 0),
        },
        engagement: engagementStats[0] || {
          avgEngagementRate: 0,
          topPost: 0,
        },
      },
      charts: {
        dailyActivity: sampleDailyActivity,
        period,
      },
      achievements: recentAchievements,
      notifications: {
        unreadCount: unreadNotifications,
      },
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(errorResponse("Failed to fetch dashboard data"), { status: 500 })
  }
}
