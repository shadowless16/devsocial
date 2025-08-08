import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import MissionProgress from "@/models/MissionProgress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const difficulty = searchParams.get("difficulty")
    const duration = searchParams.get("duration")

    const filter: any = { isActive: true }
    if (type) filter.type = type
    if (difficulty) filter.difficulty = difficulty
    if (duration) filter.duration = duration

    const missions = await Mission.find(filter)
      .populate("createdBy", "username avatar")
      .sort({ createdAt: -1 })

    // Get user's progress for each mission
    const userProgress = await MissionProgress.find({
      user: session.user.id,
      mission: { $in: missions.map(m => m._id) }
    })

    const progressMap = new Map(userProgress.map(p => [p.mission.toString(), p]))

    const missionsWithProgress = missions.map(mission => ({
      ...mission.toObject(),
      userProgress: progressMap.get(mission._id.toString()) || null
    }))

    return NextResponse.json({ missions: missionsWithProgress })
  } catch (error) {
    console.error("Get missions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, difficulty, duration, steps, rewards, prerequisites } = body

    const mission = await Mission.create({
      title,
      description,
      type,
      difficulty,
      duration,
      steps,
      rewards,
      prerequisites,
      createdBy: session.user.id
    })

    return NextResponse.json({ mission }, { status: 201 })
  } catch (error) {
    console.error("Create mission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}