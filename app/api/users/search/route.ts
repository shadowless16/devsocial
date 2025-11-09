import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Follow from "@/models/Follow"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 1) {
      // If no query, return followed users for current user
      if (session?.user?.id) {
        const followedUsers = await Follow.find({ follower: session.user.id })
          .populate("following", "username displayName avatar")
          .limit(limit)
          .sort({ createdAt: -1 })
        
        const users = followedUsers.map(f => f.following)
        return NextResponse.json({ users })
      }
      return NextResponse.json({ users: [] })
    }

    let users = []
    
    if (session?.user?.id) {
      // First, get followed users that match the query
      const followedUsers = await Follow.find({ follower: session.user.id })
        .populate({
          path: "following",
          match: {
            $or: [
              { username: { $regex: query, $options: "i" } },
              { displayName: { $regex: query, $options: "i" } }
            ]
          },
          select: "username displayName avatar"
        })
        .limit(limit)
      
      const followedMatches = followedUsers
        .map(f => f.following)
        .filter(user => user !== null)
      
      users.push(...followedMatches)
      
      // Then get other users if we need more results
      const remainingLimit = limit - users.length
      if (remainingLimit > 0) {
        const followedUserIds = followedMatches.map(u => u._id)
        const otherUsers = await User.find({
          _id: { $nin: [...followedUserIds, session.user.id] },
          $or: [
            { username: { $regex: query, $options: "i" } },
            { displayName: { $regex: query, $options: "i" } }
          ]
        })
        .select("username displayName avatar")
        .limit(remainingLimit)
        .sort({ username: 1 })
        
        users.push(...otherUsers)
      }
    } else {
      // If not logged in, just search all users
      users = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } }
        ]
      })
      .select("username displayName avatar")
      .limit(limit)
      .sort({ username: 1 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Search users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
