import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Post from "@/models/Post"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get("tag")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    if (!tag) {
      return NextResponse.json({ error: "Tag parameter required" }, { status: 400 })
    }

    const posts = await Post.find({ tags: tag })
      .populate("author", "username avatar displayName")
      .populate("tags", "name color")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments({ tags: tag })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Search posts by tag error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}