import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import { successResponse, errorResponse } from "@/utils/response"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    await connectDB()
    
    const tagName = decodeURIComponent(params.tagName)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Find posts with the specific tag
    const posts = await Post.aggregate([
      {
        $match: {
          tags: { $in: [tagName] }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            { $project: { username: 1, displayName: 1, avatar: 1, level: 1 } }
          ]
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          id: { $toString: "$_id" },
          content: 1,
          author: 1,
          tags: 1,
          imageUrl: 1,
          imageUrls: 1,
          videoUrls: 1,
          createdAt: 1,
          likesCount: { $ifNull: ["$likesCount", 0] },
          commentsCount: { $ifNull: ["$commentsCount", 0] },
          viewsCount: { $ifNull: ["$viewsCount", 0] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])

    // Get tag statistics
    const stats = await Post.aggregate([
      {
        $match: {
          tags: { $in: [tagName] }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalEngagement: {
            $sum: {
              $add: [
                { $ifNull: ["$likesCount", 0] },
                { $ifNull: ["$commentsCount", 0] }
              ]
            }
          }
        }
      }
    ])

    const tagStats = stats[0] || { totalPosts: 0, totalEngagement: 0 }

    return NextResponse.json(successResponse({
      posts,
      stats: tagStats,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    }))

  } catch (error) {
    console.error("Error fetching posts by tag:", error)
    return NextResponse.json(errorResponse("Failed to fetch posts by tag"), { status: 500 })
  }
}