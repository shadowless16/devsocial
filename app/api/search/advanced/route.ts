import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import connectDB from "@/lib/core/db"
import User from "@/models/User"
import Post from "@/models/Post"
import { authMiddleware, type AuthResult } from "@/middleware/auth"
import { successResponse, errorResponse } from "@/utils/response"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult: AuthResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error), { status: authResult.status })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const sortBy = searchParams.get("sortBy") || "relevance"
    const dateRange = searchParams.get("dateRange") || "all"
    const minLevel = searchParams.get("minLevel")
    const tags = searchParams.get("tags")?.split(",") || []
    const branch = searchParams.get("branch")
    const hasImage = searchParams.get("hasImage") === "true"
    const minLikes = searchParams.get("minLikes")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return NextResponse.json(errorResponse("Search query is required"), { status: 400 })
    }

    const searchRegex = new RegExp(query.trim(), "i")

    // Build date filter
    let dateFilter = {}
    if (dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (dateRange) {
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

      dateFilter = { createdAt: { $gte: startDate } }
    }

    interface SearchResults {
      posts: unknown[];
      users: unknown[];
      totalPosts: number;
      totalUsers: number;
    }
    
    interface PostFilter {
      $and: unknown[];
    }
    
    interface UserFilter {
      $or: unknown[];
      level?: { $gte: number };
      branch?: string;
    }
    
    const results: SearchResults = {
      posts: [],
      users: [],
      totalPosts: 0,
      totalUsers: 0,
    }

    // Advanced post search
    if (type === "all" || type === "posts") {
      const postFilter: PostFilter = {
        $and: [
          {
            $or: [{ content: searchRegex }, { tags: { $in: [searchRegex] } }],
          },
          dateFilter,
        ],
      }

      // Add tag filters
      if (tags.length > 0) {
        postFilter.$and.push({ tags: { $in: tags } })
      }

      // Add image filter
      if (hasImage) {
        postFilter.$and.push({ imageUrl: { $exists: true, $ne: null } })
      }

      // Add minimum likes filter
      if (minLikes) {
        postFilter.$and.push({ likesCount: { $gte: Number.parseInt(minLikes) } })
      }

      // Build sort criteria
      let sortCriteria: Record<string, number | { $meta: string }> = {}
      switch (sortBy) {
        case "newest":
          sortCriteria = { createdAt: -1 }
          break
        case "oldest":
          sortCriteria = { createdAt: 1 }
          break
        case "mostLiked":
          sortCriteria = { likesCount: -1 }
          break
        case "mostCommented":
          sortCriteria = { commentsCount: -1 }
          break
        default: // relevance
          sortCriteria = {
            score: { $meta: "textScore" },
            likesCount: -1,
            createdAt: -1,
          }
      }

      const posts = await Post.find(postFilter)
        .populate({
          path: "author",
          select: "username displayName avatar level branch",
          match: minLevel ? { level: { $gte: Number.parseInt(minLevel) } } : {},
        })
        .sort(sortCriteria as Record<string, 1 | -1>)
        .skip(type === "posts" ? skip : 0)
        .limit(type === "posts" ? limit : 10)
        .lean()

      // Filter out posts where author didn't match criteria
      results.posts = posts.filter((post) => post.author)
      results.totalPosts = await Post.countDocuments(postFilter)
    }

    // Advanced user search
    if (type === "all" || type === "users") {
      const userFilter: UserFilter = {
        $or: [{ username: searchRegex }, { displayName: searchRegex }, { bio: searchRegex }],
      }

      // Add level filter
      if (minLevel) {
        userFilter.level = { $gte: Number.parseInt(minLevel) }
      }

      // Add branch filter
      if (branch) {
        userFilter.branch = branch
      }

      const users = await User.find(userFilter)
        .select("username displayName avatar level points bio branch location followersCount followingCount")
        .sort({ points: -1, followersCount: -1 })
        .skip(type === "users" ? skip : 0)
        .limit(type === "users" ? limit : 10)
        .lean()

      results.users = users
      results.totalUsers = await User.countDocuments(userFilter)
    }

    // Calculate pagination
    const totalResults =
      type === "posts"
        ? results.totalPosts
        : type === "users"
          ? results.totalUsers
          : results.totalPosts + results.totalUsers

    return NextResponse.json(
      successResponse({
        results,
        query,
        filters: {
          type,
          sortBy,
          dateRange,
          minLevel,
          tags,
          branch,
          hasImage,
          minLikes,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalResults / limit),
          totalResults,
          hasMore:
            skip +
              (type === "posts"
                ? results.posts.length
                : type === "users"
                  ? results.users.length
                  : Math.max(results.posts.length, results.users.length)) <
            totalResults,
        },
      }),
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Advanced search error:", errorMessage)
    return NextResponse.json(errorResponse("Search failed"), { status: 500 })
  }
}
