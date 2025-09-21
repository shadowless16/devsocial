import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Post from "@/models/Post"
import Community from "@/models/Community"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await dbConnect()
    
    const posts = await Post.find({ community: id })
      .populate('author', 'username displayName avatar level points')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
    
    return NextResponse.json({ success: true, data: posts })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    const community = await Community.findById(id)
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 })
    }

    const isMember = community.members.some((member: any) => 
      member.toString() === session.user.id || member._id?.toString() === session.user.id
    )
    
    if (!isMember) {
      return NextResponse.json({ success: false, message: "Must be a member to post" }, { status: 403 })
    }

    const { content, tags, imageUrls } = await request.json()

    const post = await Post.create({
      content,
      tags: tags || [],
      imageUrls: imageUrls || [],
      author: session.user.id,
      community: id
    })

    await post.populate('author', 'username displayName avatar level points')
    await post.populate('community', 'name')
    
    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}