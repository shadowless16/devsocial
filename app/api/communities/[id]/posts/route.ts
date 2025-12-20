import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from '@/lib/auth/jwt-auth'
import dbConnect from "@/lib/core/db"
import Post from "@/models/Post"
import Community from "@/models/Community"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await dbConnect()
    
    const posts = await Post.find({ community: id } as Record<string, unknown>)
      .populate('author', 'username displayName avatar level points')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
    
    return NextResponse.json({ success: true, data: posts })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user?.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    interface CommunityType {
      creator: { toString: () => string }
      members: Array<{ toString: () => string; _id?: { toString: () => string } }>
    }
    
    const community = await Community.findById(id) as CommunityType | null
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 })
    }

    const isCreator = community.creator.toString() === user.userId
    
    const isMember = community.members.some((member) => {
      return member.toString() === user.userId || member._id?.toString() === user.userId;
    })
    
    if (!isCreator && !isMember) {
      return NextResponse.json({ success: false, message: "Must be a member to post" }, { status: 403 })
    }

    const { content, tags, imageUrls } = await request.json()

    const post = await Post.create({
      content,
      tags: tags || [],
      imageUrls: imageUrls || [],
      author: new mongoose.Types.ObjectId(user.userId),
      community: new mongoose.Types.ObjectId(id)
    })

    // Update community post count
    await Community.findByIdAndUpdate(id, { $inc: { postCount: 1 } } as Record<string, unknown>)

    await post.populate('author', 'username displayName avatar level points')
    await post.populate('community', 'name')
    
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}