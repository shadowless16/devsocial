import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import mongoose from "mongoose"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserStats from "@/models/UserStats"
import Referral from "@/models/Referral"
import ChallengeParticipation from "@/models/ChallengeParticipation"
import PostSchema from "@/models/Post"
import LikeSchema from "@/models/Like"
import CommentSchema from "@/models/Comment"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all-time"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let leaderboard = []

    switch (type) {
      case "weekly":
        leaderboard = await getWeeklyLeaderboard(limit)
        break
      case "monthly":
        leaderboard = await getMonthlyLeaderboard(limit)
        break
      case "referrals":
        leaderboard = await getReferralLeaderboard(limit)
        break
      case "challenges":
        leaderboard = await getChallengeLeaderboard(limit)
        break
      default:
        leaderboard = await getAllTimeLeaderboard(limit)
    }

    return NextResponse.json(successResponse({ leaderboard, type }))
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(errorResponse("Failed to fetch leaderboard"), { status: 500 })
  }
}

async function getAllTimeLeaderboard(limit: number) {
  try {
    // First try to get users with their stats
    const users = await User.find()
      .sort({ level: -1, points: -1 })
      .limit(limit)
      .select("username displayName avatar level points")
      .lean();

    // Get posts and likes counts for each user
    const userIds = users.map(u => u._id);
    
    // Count posts per user
    const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
    const postCounts = await Post.aggregate([
      { $match: { author: { $in: userIds } } },
      { $group: { _id: "$author", count: { $sum: 1 } } }
    ]);
    
    // Count likes received per user (on their posts)
    const Like = mongoose.models.Like || mongoose.model("Like", LikeSchema);
    const likeCounts = await Like.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "postInfo"
        }
      },
      { $unwind: "$postInfo" },
      { $match: { "postInfo.author": { $in: userIds } } },
      { $group: { _id: "$postInfo.author", count: { $sum: 1 } } }
    ]);
    
    // Count comments per user
    const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
    const commentCounts = await Comment.aggregate([
      { $match: { author: { $in: userIds } } },
      { $group: { _id: "$author", count: { $sum: 1 } } }
    ]);
    
    // Create lookup maps
    const postCountMap = new Map(postCounts.map(p => [p._id.toString(), p.count]));
    const likeCountMap = new Map(likeCounts.map(l => [l._id.toString(), l.count]));
    const commentCountMap = new Map(commentCounts.map(c => [c._id.toString(), c.count]));
    
    // Check if UserStats exists and merge data
    let userStatsMap = new Map();
    try {
      const userStats = await UserStats.find({ userId: { $in: userIds } }).lean();
      userStats.forEach(stat => {
        userStatsMap.set(stat.userId.toString(), stat);
      });
    } catch (e) {
      console.log("UserStats not available");
    }
    
    return users.map(user => {
      const userId = user._id.toString();
      const stats = userStatsMap.get(userId);
      
      return {
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          level: user.level,
        },
        totalXP: stats?.totalXP || user.points || 0,
        totalPosts: postCountMap.get(userId) || stats?.postsCount || 0,
        totalLikes: likeCountMap.get(userId) || stats?.likesReceived || 0,
        totalComments: commentCountMap.get(userId) || stats?.commentsCount || 0,
        level: stats?.currentLevel || user.level,
        rank: stats?.currentRank || "Developer",
      };
    });
  } catch (error) {
    console.error("Error in getAllTimeLeaderboard:", error);
    return [];
  }

  // Fallback to User model if UserStats doesn't exist or is empty
  const users = await User.find()
    .sort({ level: -1, points: -1 })
    .limit(limit)
    .select("username displayName avatar level points")
    .lean();

  return users.map(user => ({
    user: {
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      level: user.level,
    },
    totalXP: user.points || 0,
    totalPosts: 0, // Would need to count from Post model
    totalLikes: 0, // Would need to count from Like model
    totalComments: 0, // Would need to count from Comment model
    level: user.level,
    rank: "Developer",
  }));
}

async function getWeeklyLeaderboard(limit: number) {
  try {
    // For now, use the same logic as all-time but with weeklyXP if available
    const userStats = await UserStats.find()
      .populate("userId", "username displayName avatar level")
      .sort({ weeklyXP: -1, totalXP: -1 })
      .limit(limit)
      .lean();

    if (userStats.length > 0) {
      return userStats.map(stat => ({
        user: stat.userId,
        totalXP: stat.weeklyXP || stat.totalXP || 0,
        totalPosts: stat.postsCount || 0,
        totalLikes: stat.likesReceived || 0,
        totalComments: stat.commentsCount || 0,
        level: stat.currentLevel || 1,
        rank: stat.currentRank || "Developer",
      }));
    }
  } catch (error) {
    console.log("UserStats weekly query failed, using all-time data");
  }
  
  // Fallback to all-time data
  return await getAllTimeLeaderboard(limit);
}

async function getMonthlyLeaderboard(limit: number) {
  try {
    // For now, use the same logic as all-time but with monthlyXP if available
    const userStats = await UserStats.find()
      .populate("userId", "username displayName avatar level")
      .sort({ monthlyXP: -1, totalXP: -1 })
      .limit(limit)
      .lean();

    if (userStats.length > 0) {
      return userStats.map(stat => ({
        user: stat.userId,
        totalXP: stat.monthlyXP || stat.totalXP || 0,
        totalPosts: stat.postsCount || 0,
        totalLikes: stat.likesReceived || 0,
        totalComments: stat.commentsCount || 0,
        level: stat.currentLevel || 1,
        rank: stat.currentRank || "Developer",
      }));
    }
  } catch (error) {
    console.log("UserStats monthly query failed, using all-time data");
  }
  
  // Fallback to all-time data
  return await getAllTimeLeaderboard(limit);
}

async function getReferralLeaderboard(limit: number) {
  return await Referral.aggregate([
    {
      $match: { status: "completed" },
    },
    {
      $group: {
        _id: "$referrer",
        referralCount: { $sum: 1 },
        totalRewards: { $sum: "$referrerReward" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $lookup: {
        from: "userstats",
        localField: "_id",
        foreignField: "user",
        as: "stats",
      },
    },
    {
      $unwind: "$stats",
    },
    {
      $sort: { referralCount: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        user: "$userInfo",
        totalXP: "$totalRewards",
        referralCount: 1,
        level: "$stats.level",
        rank: "$stats.rank",
      },
    },
  ])
}

async function getChallengeLeaderboard(limit: number) {
  return await ChallengeParticipation.aggregate([
    {
      $match: { status: "completed" },
    },
    {
      $group: {
        _id: "$user",
        challengesCompleted: { $sum: 1 },
        totalXPEarned: { $sum: "$xpEarned" },
        firstCompletions: {
          $sum: { $cond: ["$isFirstCompletion", 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $lookup: {
        from: "userstats",
        localField: "_id",
        foreignField: "user",
        as: "stats",
      },
    },
    {
      $unwind: "$stats",
    },
    {
      $sort: { challengesCompleted: -1, firstCompletions: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        user: "$userInfo",
        totalXP: "$totalXPEarned",
        challengesCompleted: 1,
        firstCompletions: 1,
        level: "$stats.level",
        rank: "$stats.rank",
      },
    },
  ])
}
