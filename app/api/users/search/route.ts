import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { displayName: { $regex: query, $options: "i" } }
      ]
    })
    .select("username displayName avatar")
    .limit(limit)
    .sort({ username: 1 })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Search users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}