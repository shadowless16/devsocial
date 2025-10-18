import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()
    const { userId } = await params

    await Promise.all([
      User.findByIdAndDelete(userId),
      Post.deleteMany({ author: userId }),
      Comment.deleteMany({ author: userId })
    ])

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete user" 
    }, { status: 500 })
  }
}
