import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import MissionProgress from "@/models/MissionProgress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { missionId } = await request.json()

    const mission = await Mission.findById(missionId)
    if (!mission || !mission.isActive) {
      return NextResponse.json({ error: "Mission not found or inactive" }, { status: 404 })
    }

    // Check if user already joined
    const existingProgress = await MissionProgress.findOne({
      user: session.user.id,
      mission: missionId
    })

    if (existingProgress) {
      return NextResponse.json({ error: "Already joined this mission" }, { status: 400 })
    }

    // Initialize progress for each step
    const progress = mission.steps.map((step: any) => ({
      stepId: step.id,
      current: 0,
      target: step.target,
      completed: false
    }))

    const missionProgress = await MissionProgress.create({
      user: session.user.id,
      mission: missionId,
      progress
    })

    // Update mission participant count
    await Mission.findByIdAndUpdate(missionId, {
      $inc: { participantCount: 1 }
    })

    return NextResponse.json({ missionProgress }, { status: 201 })
  } catch (error) {
    console.error("Join mission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}