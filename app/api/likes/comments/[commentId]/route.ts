// app/api/likes/comments/[commentId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth/server-auth';
import Like from "@/models/Like";
import Comment from "@/models/Comment";
import connectDB from "@/lib/core/db";
import { errorResponse } from "@/utils/response";
import { handleDatabaseError } from "@/lib/api/api-error-handler";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    await connectDB();

    const session = await getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const userId = session.user.id;
    const { commentId } = await params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(errorResponse("Comment not found"), { status: 404 });
    }

    const existingLike = await Like.findOne({ user: userId, targetId: commentId, targetType: 'comment' });

    let liked = false;
    let likesCount = await Like.countDocuments({ targetId: commentId, targetType: 'comment' });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      const like = new Like({
        user: userId,
        targetId: commentId,
        targetType: 'comment'
      });
      await like.save();
      likesCount += 1;
      liked = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        liked,
        likesCount,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Error toggling comment like:", errorMessage);
    return handleDatabaseError(error);
  }
}