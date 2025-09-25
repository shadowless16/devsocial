// app/api/likes/posts/[postId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Like from "@/models/Like";
import Post from "@/models/Post";
import Activity from "@/models/Activity";
import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";
import { awardXP } from "@/utils/awardXP";
import { getWebSocketServer } from "@/lib/websocket";
import { handleDatabaseError } from "@/lib/api-error-handler";
// Only import mission models if needed
let MissionProgress: any = null;
let Mission: any = null;

try {
  MissionProgress = require("@/models/MissionProgress").default;
  Mission = require("@/models/Mission").default;
} catch (error) {
  console.warn("Mission models not available:", error);
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const userId = session.user.id;
    const { postId } = await params;

    const post = await Post.findById(postId).populate("author", "username displayName");
    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 });
    }

    const existingLike = await Like.findOne({ user: userId, targetId: postId, targetType: 'post' });

    let liked = false;
    let likesCount = post.likesCount;

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      likesCount = Math.max(0, likesCount - 1);
      await Post.findByIdAndUpdate(postId, { likesCount });
    } else {
      const like = new Like({
        user: userId,
        targetId: postId,
        targetType: 'post'
      });
      await like.save();

      likesCount += 1;
      await Post.findByIdAndUpdate(postId, { likesCount });
      liked = true;

      await awardXP(userId, "like_given");

      // Only track mission progress if user has explicitly joined missions
      if (MissionProgress && Mission) {
        try {
          const activeMissions = await MissionProgress.find({
            user: userId,
            status: "active"
          }).populate('mission');

          for (const progress of activeMissions) {
            const mission = progress.mission;
            if (!mission) continue;
            
            let progressUpdated = false;
            
            for (const step of mission.steps) {
              const stepId = step.id || step._id?.toString();
              if (!progress.stepsCompleted.includes(stepId)) {
                // Check if this step is related to liking posts
                const stepText = (step.title + ' ' + step.description).toLowerCase();
                if (stepText.includes('like') && stepText.includes('post')) {
                  // Get current like count for user
                  const userLikeCount = await Like.countDocuments({ user: userId, targetType: 'post' });
                  
                  // Check if target is met
                  if (userLikeCount >= (step.target || 1)) {
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
        } catch (missionError) {
          console.warn("Mission tracking failed, continuing with like:", missionError);
        }
      }

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
          title: `${session.user.username} liked your post`,
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
            sender: { id: session.user.id, username: session.user.username },
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

    return NextResponse.json({
      success: true,
      data: { liked, likesCount }
    });
  } catch (error: any) {
    console.error("Error toggling post like:", error);
    return handleDatabaseError(error);
  }
}