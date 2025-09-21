import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Community from "@/models/Community"
import Post from "@/models/Post"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await dbConnect()
    
    const community = await Community.findById(id)
      .populate('creator', 'username displayName avatar')
      .populate('members', 'username displayName avatar')
    
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 })
    }

    // Ensure counts are accurate
    const actualMemberCount = community.members?.length || 0
    const actualPostCount = await Post.countDocuments({ community: id })
    
    // Update counts if they're incorrect
    if (community.memberCount !== actualMemberCount || community.postCount !== actualPostCount) {
      await Community.findByIdAndUpdate(id, {
        memberCount: actualMemberCount,
        postCount: actualPostCount
      })
      community.memberCount = actualMemberCount
      community.postCount = actualPostCount
    }
    
    return NextResponse.json({ success: true, data: community })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}