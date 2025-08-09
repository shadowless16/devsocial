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
import MissionProgress from "@/models/MissionProgress"

export const dynamic = 'force-dynamic'

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

    return NextResponse.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          hasMore: skip + comments.length < totalComments,
        },
      }
    })
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
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
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

    // Auto-track mission progress for comment creation
    const activeMissions = await MissionProgress.find({
      user: userId,
      status: "active"
    }).populate('mission');

    for (const progress of activeMissions) {
      const mission = progress.mission;
      let progressUpdated = false;
      
      for (const step of mission.steps) {
        const stepId = step.id || step._id?.toString();
        if (!progress.stepsCompleted.includes(stepId)) {
          // Check if this step is related to commenting
          const stepText = (step.title + ' ' + step.description).toLowerCase();
          if (stepText.includes('comment')) {
            // Get current comment count for user
            const userCommentCount = await Comment.countDocuments({ author: userId });
            
            // Check if target is met
            if (userCommentCount >= (step.target || 1)) {
              progress.stepsCompleted.push(stepId);
              progressUpdated = true;
            }
          }
        }
      }
      
      // Check if mission is completed
      if (progress.stepsCompleted.length >= mission.steps.length && progress.status !== 'completed') {
        progress.status = "completed";
        progress.completedAt = new Date();
        progress.xpEarned = mission.rewards.xp;
        progressUpdated = true;
      }
      
      if (progressUpdated) {
        await progress.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: { comment }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(errorResponse("Failed to create comment"), { status: 500 })
  }
}
