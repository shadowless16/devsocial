import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/core/db"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import Like from "@/models/Like"
import { authMiddleware } from "@/middleware/auth"
import { errorResponse } from "@/utils/response"

export const dynamic = 'force-dynamic'

// GET /api/posts/[id] - Get single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const post = await Post.findById(id)
      .populate("author", "username avatar level role")
      .select('content author tags imageUrl imageUrls videoUrls isAnonymous createdAt likesCount commentsCount viewsCount xpAwarded imprintStatus onChainProof')
      .lean()

    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 })
    }

    // Get recent comments
    const comments = await Comment.find({ post: id })
      .populate("author", "username avatar level")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Format post for response
    const postData = post as unknown as { _id: unknown; isAnonymous?: boolean; author: { username: string; avatar: string; level: number }; content: string; imageUrl?: string; imageUrls?: string[]; videoUrls?: string[]; tags: string[]; likesCount: number; commentsCount: number; viewsCount?: number; xpAwarded: number; createdAt: Date }
    const formattedPost = {
      id: postData._id,
      author: postData.isAnonymous
        ? {
            username: "anonymous",
            displayName: "Anonymous",
            avatar: "/placeholder.svg?height=40&width=40",
            level: 0,
          }
        : {
            username: postData.author.username,
            displayName: postData.author.username,
            avatar: postData.author.avatar,
            level: postData.author.level,
          },
      content: postData.content,
      imageUrl: postData.imageUrl,
      imageUrls: postData.imageUrls || [],
      videoUrls: postData.videoUrls || [],
      tags: postData.tags,
      likesCount: postData.likesCount,
      commentsCount: postData.commentsCount,
      viewsCount: postData.viewsCount || 0,
      xpAwarded: postData.xpAwarded,
      createdAt: postData.createdAt,
      isAnonymous: postData.isAnonymous,
      isLiked: false, // TODO: Check if current user liked this post
      comments: comments.map((comment) => ({
        id: comment._id,
        author: {
          username: (comment.author as any).username,
          displayName: (comment.author as any).username,
          avatar: (comment.author as any).avatar,
          level: (comment.author as any).level,
        },
        content: comment.content,
        likesCount: comment.likesCount,
        createdAt: comment.createdAt,
        isLiked: false, // TODO: Check if current user liked this comment
      })),
    }

    return NextResponse.json({
      success: true,
      data: { post: formattedPost }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Get post error:", errorMessage)
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 })
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json(errorResponse(authResult.error || 'Authentication failed'), { status: 401 })
    }

    const userId = authResult.user.id
    const { id: postId } = await params

    // Find the post
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(errorResponse("Post not found"), { status: 404 })
    }

    // Check if user is the author or has admin/moderator role
    const userRole = authResult.user.role
    if (post.author.toString() !== userId && userRole !== "admin" && userRole !== "moderator") {
      return NextResponse.json(errorResponse("You don't have permission to delete this post"), { status: 403 })
    }

    // Delete all likes associated with this post
    await Like.deleteMany({ post: postId })

    // Delete all comments associated with this post
    const comments = await Comment.find({ post: postId })
    const commentIds = comments.map(comment => comment._id)
    
    // Delete likes on comments
    await Like.deleteMany({ comment: { $in: commentIds } })
    
    // Delete comments
    await Comment.deleteMany({ post: postId })

    // Delete the post
    await Post.findByIdAndDelete(postId)

    return NextResponse.json({
      success: true,
      data: { message: "Post deleted successfully" }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error("Delete post error:", errorMessage)
    return NextResponse.json(errorResponse("Failed to delete post"), { status: 500 })
  }
}
