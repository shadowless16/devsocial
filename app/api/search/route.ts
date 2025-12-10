import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import connectDB from "@/lib/core/db"


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
      return NextResponse.json({ success: false, message: "Search query is required" }, { status: 400 })
    }

    const searchRegex = new RegExp(query.trim(), "i")
    const results: { posts: unknown[]; users: unknown[]; tags: unknown[] } = {
      posts: [],
      users: [],
      tags: [],
    }

    // Search posts
    if (type === "all" || type === "posts") {
      const posts = await Post.find({
        content: searchRegex
      })
        .populate("author", "username displayName avatar level")
        .populate("tags", "name")
        .sort({ createdAt: -1 })
        .skip(type === "posts" ? skip : 0)
        .limit(type === "posts" ? limit : 10)

      // Transform posts to include id field
      results.posts = posts.map(post => ({
        ...post.toObject(),
        id: post._id.toString()
      }))
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

    // Search tags - search in post tags array
    if (type === "all" || type === "tags") {
      // Normalize search query for tags (remove # prefix)
      const normalizedQuery = query.replace(/^#/, '').toLowerCase().trim()
      const tagSearchRegex = new RegExp(normalizedQuery, "i")
      
      const postTags = await Post.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: tagSearchRegex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: type === "tags" ? limit : 10 }
      ])
      
      results.tags = postTags.map((tag) => ({
        tag: tag._id,
        count: tag.count,
        posts: tag.count,
      }))
    }

    // Calculate totals for pagination
    const totals = {
      posts:
        type === "posts"
          ? await Post.countDocuments({
              content: searchRegex
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

    return NextResponse.json({
      success: true,
      data: {
        results,
        query,
        type,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totals[type as keyof typeof totals] / limit),
          totalResults: totals[type as keyof typeof totals],
          hasMore: skip + (results[type === "all" ? "posts" : type] || []).length < totals[type as keyof typeof totals],
        },
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error performing search:", errorMessage)
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 })
  }
}
