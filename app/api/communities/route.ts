import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/jwt-auth"
import dbConnect from "@/lib/core/db"
import Community from "@/models/Community"

export async function GET() {
  try {
    await dbConnect()
    const communities = await Community.find({})
      .populate('creator', 'username displayName avatar')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({ success: true, data: communities })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user?.userId) {
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
      creator: user.userId,
      members: [user.userId],
      memberCount: 1
    })

    const populatedCommunity = await Community.findById(community._id).populate('creator', 'username displayName avatar')
    
    return NextResponse.json({ success: true, data: populatedCommunity })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Community creation error:', errorMessage)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
