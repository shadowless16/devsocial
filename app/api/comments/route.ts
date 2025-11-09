// app/api/comments/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { authMiddleware, type AuthenticatedRequest } from "@/middleware/auth";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";
import { awardXP } from "@/utils/awardXP";
import { getWebSocketServer } from "@/lib/websocket";
import Notification from "@/models/Notification";
import { processMentions } from "@/utils/mention-utils";

export const dynamic = 'force-dynamic'

//================================================================//
//  GET /api/comments - Fetch comments for a post
//================================================================//
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return errorResponse("Post ID is required.", 400);
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "username displayName avatar level")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(successResponse({ comments }));
  } catch (error: any) {
    console.error("[API_COMMENTS_GET_ERROR]", error);
    return errorResponse("Failed to fetch comments due to a server error.", 500);
  }
}

//================================================================//
//  POST /api/comments - Create a new comment
//================================================================//
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 });
    }

    const body = await req.json();
    const { postId, content } = body;
    const authorId = authResult.user.id;

    if (!postId || !content || content.trim().length === 0) {
      return errorResponse("Post ID and comment content are required.", 400);
    }

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse("Post not found.", 404);
    }

    // Process mentions before creating comment
    const { mentions, mentionIds } = await processMentions(content, postId, authorId);

    const newComment = await Comment.create({
      content,
      author: authorId,
      post: postId,
      mentions,
      mentionIds,
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    // Process mentions with actual comment ID
    if (mentions.length > 0) {
      await processMentions(content, postId, authorId, newComment._id.toString());
    }

    await awardXP(authorId, "comment_creation");

    if (post.author.toString() !== authorId) {
      const notification = new Notification({
        recipient: post.author,
        sender: authorId,
        type: "comment",
        title: `${authResult.user.displayName || authResult.user.username} commented on your post`,
        message: content.substring(0, 100),
        actionUrl: `/post/${postId}`,
        data: { postId, commentId: newComment._id },
      });
      await notification.save();

      const wsServer = getWebSocketServer();
      if (wsServer) {
        wsServer.sendNotificationToUser(post.author.toString(), {
          type: "comment",
          title: notification.title,
          message: notification.message,
          sender: authResult.user,
          createdAt: notification.createdAt,
        });
      }
    }

    const populatedComment = await Comment.findById(newComment._id)
      .populate("author", "username displayName avatar level")
      .lean();

    return NextResponse.json(
      successResponse({ comment: populatedComment }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API_COMMENTS_POST_ERROR]", error);
    return errorResponse("Failed to create comment due to a server error.", 500);
  }
}
