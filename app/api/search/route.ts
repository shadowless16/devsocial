import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return NextResponse.json(errorResponse("Search query is required"), { status: 400 })
    }

    const searchRegex = new RegExp(query.trim(), "i")
    const results: any = {
      posts: [],
      users: [],
      tags: [],
    }

    // Search posts
    if (type === "all" || type === "posts") {
      const posts = await Post.find({
        $or: [{ content: searchRegex }, { tags: { $in: [searchRegex] } }],
      })
        .populate("author", "username displayName avatar level")
        .sort({ createdAt: -1 })
        .skip(type === "posts" ? skip : 0)
        .limit(type === "posts" ? limit : 10)

      results.posts = posts
    }

    // Search users
    if (type === "all" || type === "users") {
      const users = await User.find({
        $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
      })
        .select("username displayName avatar level points bio")
        .sort({ points: -1 })
        .skip(type === "users" ? skip : 0)
        .limit(type === "users" ? limit : 10)

      results.users = users
    }

    // Search tags
    if (type === "all" || type === "tags") {
      const tagAggregation = await Post.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: searchRegex } },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
            posts: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: type === "tags" ? limit : 10 },
      ])

      results.tags = tagAggregation.map((tag) => ({
        tag: tag._id,
        count: tag.count,
        posts: tag.posts,
      }))
    }

    // Calculate totals for pagination
    const totals = {
      posts:
        type === "posts"
          ? await Post.countDocuments({
              $or: [{ content: searchRegex }, { tags: { $in: [searchRegex] } }],
            })
          : results.posts.length,
      users:
        type === "users"
          ? await User.countDocuments({
              $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
            })
          : results.users.length,
      tags: results.tags.length,
    }

    return NextResponse.json(
      successResponse({
        results,
        query,
        type,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totals[type as keyof typeof totals] / limit),
          totalResults: totals[type as keyof typeof totals],
          hasMore: skip + (results[type === "all" ? "posts" : type] || []).length < totals[type as keyof typeof totals],
        },
      }),
    )
  } catch (error) {
    console.error("Error performing search:", error)
    return NextResponse.json(errorResponse("Search failed"), { status: 500 })
  }
}
