// app/api/likes/comments/[commentId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Like from "@/models/Like";
import Comment from "@/models/Comment";
import connectDB from "@/lib/db";
import { errorResponse } from "@/utils/response";
import { handleDatabaseError } from "@/lib/api-error-handler";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
    }

    const userId = session.user.id;
    const { commentId } = await params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(errorResponse("Comment not found"), { status: 404 });
    }

    const existingLike = await Like.findOne({ user: userId, comment: commentId });

    let liked = false;
    let likesCount = await Like.countDocuments({ comment: commentId });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      const like = new Like({
        user: userId,
        comment: commentId
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
  } catch (error: any) {
    console.error("Error toggling comment like:", error);
    return handleDatabaseError(error);
  }
}