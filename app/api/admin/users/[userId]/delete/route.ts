import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import connectDB from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

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
