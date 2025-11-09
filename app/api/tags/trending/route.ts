import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Tag from "@/models/Tag"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const trendingTags = await Tag.find({})
      .sort({ usageCount: -1 })
      .limit(limit)
      .select('name usageCount')

    return NextResponse.json({
      success: true,
      tags: trendingTags
    })
  } catch (error) {
    console.error("Get trending tags error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
