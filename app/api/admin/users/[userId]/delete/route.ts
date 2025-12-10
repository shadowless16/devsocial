import { type NextRequest, NextResponse } from "next/server"
import User from "@/models/User"
import Post from "@/models/Post"
import Comment from "@/models/Comment"
import connectDB from "@/lib/core/db"
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from "@/lib/auth/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession(request)
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
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to delete user" 
    }, { status: 500 })
  }
}
