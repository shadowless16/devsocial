import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/middleware/auth"
import Comment from "@/models/Comment"
import Post from "@/models/Post"
import connectDB from "@/lib/db"
import { successResponse, errorResponse } from "@/utils/response"

export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'An unknown authentication error occurred.'), { status: 401 })
    }

    const userId = authResult.user!.id
    const { commentId } = params

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return NextResponse.json(errorResponse("Comment not found"), { status: 404 })
    }

    // Check if user owns the comment or is admin/moderator
    if (comment.author.toString() !== userId && !["admin", "moderator"].includes(authResult.user!.role)) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 403 })
    }

    // Update post comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } })

    // Delete the comment
    await Comment.findByIdAndDelete(commentId)

    return NextResponse.json(successResponse({ message: "Comment deleted successfully" }))
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(errorResponse("Failed to delete comment"), { status: 500 })
  }
}
