// app/api/likes/posts/[postId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { authMiddleware, type AuthenticatedRequest } from "@/middleware/auth";
import Like from "@/models/Like";
import Post from "@/models/Post";
import Activity from "@/models/Activity";
import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";
import { awardXP } from "@/utils/awardXP";
import { getWebSocketServer } from "@/lib/websocket";

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 });
    }

    const userId = (request as AuthenticatedRequest).user.id;
    const { postId } = params;

    const post = await Post.findById(postId).populate("author", "username displayName");
    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 });
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });

    let liked = false;
    let likesCount = post.likesCount;

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      likesCount = Math.max(0, likesCount - 1);
      await Post.findByIdAndUpdate(postId, { likesCount });
    } else {
      const like = new Like({
        user: userId,
        post: postId,
        comment: undefined, // Ensure comment is unset
      });
      await like.save();

      likesCount += 1;
      await Post.findByIdAndUpdate(postId, { likesCount });
      liked = true;

      await awardXP(userId, 5, "like_given");

      const activity = new Activity({
        user: userId,
        type: "like_given",
        description: `Liked a post`,
        metadata: {
          postId,
          postTitle: post.content.substring(0, 50),
        },
        xpEarned: 5,
      });
      await activity.save();

      if (post.author._id.toString() !== userId) {
        const notification = new Notification({
          recipient: post.author._id,
          sender: userId,
          type: "like",
          title: `${(request as AuthenticatedRequest).user.displayName} liked your post`,
          message: post.content.substring(0, 100),
          actionUrl: `/post/${postId}`,
          data: { postId },
        });
        await notification.save();

        const wsServer = getWebSocketServer();
        if (wsServer) {
          wsServer.sendNotificationToUser(post.author._id.toString(), {
            type: "like",
            title: notification.title,
            message: notification.message,
            sender: (request as AuthenticatedRequest).user,
            createdAt: notification.createdAt,
          });
        }
      }
    }

    const wsServer = getWebSocketServer();
    if (wsServer) {
      wsServer.broadcast("post_like_update", {
        postId,
        likesCount,
        liked,
        userId,
      });
    }

    return NextResponse.json(successResponse({ liked, likesCount }));
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json(errorResponse("Failed to toggle like"), { status: 500 });
  }
}