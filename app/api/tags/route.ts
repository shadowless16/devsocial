import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Tag from "@/models/Tag"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const popular = searchParams.get("popular") === "true"

    let query = {}
    if (search) {
      query = { name: { $regex: search, $options: "i" } }
    }

    const tags = await Tag.find(query)
      .sort(popular ? { usageCount: -1 } : { createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "username")

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Get tags error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, color } = await request.json()
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "")
    
    const existingTag = await Tag.findOne({ slug })
    if (existingTag) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 400 })
    }

    const tag = await Tag.create({
      name,
      slug,
      description,
      color: color || "#3b82f6",
      createdBy: session.user.id
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error("Create tag error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
