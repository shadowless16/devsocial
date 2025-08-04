// app/api/likes/comments/[commentId]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth";
import Comment from "@/models/Comment";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    await connectDB();

    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.message), { status: 401 });
    }

    const userId = authResult.user!.id;
    const { commentId } = params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(errorResponse("Comment not found"), { status: 404 });
    }

    const userIndex = comment.likes.indexOf(userId as any);
    let liked = false;

    if (userIndex > -1) {
      comment.likes.splice(userIndex, 1);
    } else {
      comment.likes.push(userId as any);
      liked = true;
    }

    await comment.save();

    return NextResponse.json(
      successResponse({
        liked,
        likesCount: comment.likes.length,
      })
    );
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(errorResponse("Failed to toggle like"), { status: 500 });
  }
}