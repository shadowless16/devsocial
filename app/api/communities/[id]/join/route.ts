import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from '@/lib/auth/jwt-auth'
import dbConnect from "@/lib/core/db"
import Community from "@/models/Community"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user?.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    const community = await Community.findById(id)
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 })
    }

    const userId = user.userId
    const isMember = community.members.some((m: any) => m.toString() === userId)
    const isCreator = community.creator.toString() === userId

    // Prevent creator from leaving their own community
    if (isCreator && isMember) {
      return NextResponse.json({ 
        success: false, 
        message: "Community creators cannot leave their own community" 
      }, { status: 400 })
    }

    if (isMember) {
      // Leave community
      community.members = community.members.filter((memberId: any) => memberId.toString() !== userId)
      community.memberCount = Math.max(0, community.memberCount - 1)
    } else {
      // Join community
      (community.members as any).push(userId)
      community.memberCount += 1
    }

    await community.save()
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        isJoined: !isMember,
        memberCount: community.memberCount 
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}