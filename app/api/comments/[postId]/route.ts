import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Comment from "@/models/Comment"
import Post from "@/models/Post"
import Activity from "@/models/Activity"
import Notification from "@/models/Notification"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"
import { awardXP } from "@/utils/awardXP"
import { getWebSocketServer } from "@/lib/websocket"

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    await connectDB()

    const { postId } = params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get top-level comments (no parent)
    const comments = await Comment.find({ post: postId, parentComment: { $exists: false } })
      .populate("author", "username displayName avatar level")
      .sort({ createdAt: 1 }) // Changed to ascending (oldest first)
      .skip(skip)
      .limit(limit)

    // For each comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("author", "username displayName avatar level")
          .sort({ createdAt: 1 }) // Oldest first for replies
        
        return {
          ...comment.toObject(),
          _id: comment._id,
          likesCount: comment.likesCount || comment.likes?.length || 0,
          replies: replies.map(reply => ({
            ...reply.toObject(),
            _id: reply._id,
            likesCount: reply.likesCount || reply.likes?.length || 0
          })),
          repliesCount: replies.length
        }
      })
    )

    const totalComments = await Comment.countDocuments({ post: postId, parentComment: { $exists: false } })

    return NextResponse.json(
      successResponse({
        comments: commentsWithReplies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasMore: skip + comments.length < totalComments,
        },
      }),
    )
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(errorResponse("Failed to fetch comments"), { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 })
    }

    const userId = authResult.user!.id
    const { postId } = params
    const { content, parentCommentId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(errorResponse("Comment content is required"), { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json(errorResponse("Comment is too long"), { status: 400 })
    }

    // Check if post exists
    const post = await Post.findById(postId).populate("author", "username displayName")
    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 })
    }

    const comment = new Comment({
      author: userId,
      post: postId,
      content: content.trim(),
      parentComment: parentCommentId // Set parentComment if provided
    })

    await comment.save()
    await comment.populate("author", "username displayName avatar level")

    // Update post comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })

    // Award XP to comment author
    await awardXP(userId, "comment_creation", comment._id.toString())

    // Create activity log
    const activity = new Activity({
      user: userId,
      type: "comment_created",
      description: `Commented on a post`,
      metadata: {
        postId,
        commentId: comment._id,
        postTitle: post.content.substring(0, 50),
      },
      xpEarned: 10,
    })
    await activity.save()

    // Create notification for post author (if not commenting on own post)
    if (post.author._id.toString() !== userId) {
      const notification = new Notification({
        recipient: post.author._id,
        sender: userId,
        type: "comment",
        title: `${authResult.user!.displayName} commented on your post`,
        message: content.substring(0, 100),
        actionUrl: `/post/${postId}`,
        data: {
          postId,
          commentId: comment._id,
        },
      })
      await notification.save()

      // Send real-time notification
      const wsServer = getWebSocketServer()
      if (wsServer) {
        wsServer.sendNotificationToUser(post.author._id.toString(), {
          type: "comment",
          title: notification.title,
          message: notification.message,
          sender: authResult.user,
          createdAt: notification.createdAt,
        })
      }
    }

    return NextResponse.json(successResponse({ comment }), { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(errorResponse("Failed to create comment"), { status: 500 })
  }
}
