import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Community from "@/models/Community"

export async function GET() {
  try {
    await dbConnect()
    const communities = await Community.find({})
      .populate('creator', 'username displayName avatar')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({ success: true, data: communities })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { name, description, category, longDescription, rules } = await request.json()

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const community = await Community.create({
      name,
      slug,
      description,
      category,
      longDescription,
      rules: rules?.filter((rule: string) => rule?.trim()) || [],
      creator: session.user.id,
      members: [session.user.id],
      memberCount: 1
    })

    const populatedCommunity = await Community.findById(community._id).populate('creator', 'username displayName avatar')
    
    return NextResponse.json({ success: true, data: populatedCommunity })
  } catch (error: any) {
    console.error('Community creation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}