import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import MissionProgress from "@/models/MissionProgress"
import Mission from "@/models/Mission"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"


export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 })
    }

    const { stepId } = await request.json()
    const missionId = params.id

    // Find the mission progress
    let progress = await MissionProgress.findOne({
      user: session.user.id,
      mission: missionId
    })

    if (!progress) {
      return NextResponse.json({ 
        success: false,
        error: "Mission not joined" 
      }, { status: 404 })
    }

    // Update step completion
    if (!progress.stepsCompleted.includes(stepId)) {
      progress.stepsCompleted.push(stepId)
      progress.currentStep = progress.stepsCompleted.length

      // Check if mission is completed
      const mission = await Mission.findById(missionId)
      if (progress.stepsCompleted.length >= mission.steps.length) {
        progress.status = "completed"
        progress.completedAt = new Date()
        progress.xpEarned = mission.rewards.xp
      }

      await progress.save()
    }

    return NextResponse.json({ 
      success: true,
      data: { progress }
    })
  } catch (error) {
    console.error("Update mission progress error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
  }
}