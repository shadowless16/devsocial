// app/api/likes/posts/[postId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth/server-auth';
import Like from "@/models/Like";
import Post from "@/models/Post";
import Activity from "@/models/Activity";
import connectDB from "@/lib/core/db";
import { errorResponse } from "@/utils/response";
import { awardXP } from "@/utils/awardXP";
import { getWebSocketServer } from "@/lib/realtime/websocket";
import { handleDatabaseError } from "@/lib/api/api-error-handler";
import { notifyLike } from "@/lib/notifications/notification-helper";


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    await connectDB();

    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const userId = session.user.id;
    const { postId } = await params;

    if (!userId || !postId) {
      return NextResponse.json(errorResponse('Invalid user or post ID'), { status: 400 });
    }

    // Use Promise.all for parallel queries
    const [post, existingLike] = await Promise.all([
      Post.findById(postId).select('author content likesCount').populate("author", "username displayName"),
      Like.findOne({ user: userId, targetId: postId, targetType: 'post' })
    ]);

    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 });
    }

    let liked = false;
    let likesCount = post.likesCount;

    if (existingLike) {
      // Unlike
      await Promise.all([
        Like.findByIdAndDelete(existingLike._id),
        Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })
      ]);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      // Like
      try {
        await Promise.all([
          Like.create({ user: userId, targetId: postId, targetType: 'post' }),
          Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })
        ]);
        likesCount += 1;
        liked = true;

        // Background tasks - don't await to improve response time
        setImmediate(async () => {
          try {
            await Promise.all([
              awardXP(userId, "like_given"),
              Activity.create({
                user: userId,
                type: "like_given",
                description: `Liked a post`,
                metadata: {
                  postId,
                  postTitle: post.content.substring(0, 50),
                },
                xpEarned: 5,
              })
            ]);

            // Create notification with push if not self-like
            if (post.author._id.toString() !== userId) {
              await notifyLike(
                post.author._id.toString(),
                userId,
                postId,
                session.user.username || 'Someone'
              );

              const wsServer = getWebSocketServer();
              if (wsServer) {
                wsServer.sendNotificationToUser(post.author._id.toString(), {
                  type: "like",
                  title: `${session.user.username} liked your post`,
                  message: post.content.substring(0, 100),
                  sender: { id: session.user.id, username: session.user.username },
                  createdAt: new Date(),
                });
              }
            }
          } catch (bgError) {
            console.warn("Background task failed:", bgError);
          }
        });
      } catch (likeError) {
        if (likeError.code === 11000) {
          return NextResponse.json({
            success: true,
            data: { liked: true, likesCount: post.likesCount }
          });
        }
        throw likeError;
      }
    }

    // Send real-time update
    const wsServer = getWebSocketServer();
    if (wsServer) {
      wsServer.broadcast("post_like_update", {
        postId,
        likesCount,
        liked,
        userId,
      });
    }

    return NextResponse.json({
      success: true,
      data: { liked, likesCount }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error toggling post like:", errorMessage);
    return handleDatabaseError(error);
  }
}