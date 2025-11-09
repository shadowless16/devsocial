import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(req)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      type, 
      difficulty, 
      duration, 
      steps, 
      rewards, 
      prerequisites,
      aiGenerated = true 
    } = body

    // Validate required fields
    if (!title || !description || !type || !difficulty || !duration || !steps || !rewards) {
      return NextResponse.json({ 
        error: "Missing required fields: title, description, type, difficulty, duration, steps, rewards" 
      }, { status: 400 })
    }

    // Validate mission type
    const validTypes = ["social", "content", "engagement", "learning", "achievement"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}` 
      }, { status: 400 })
    }

    // Validate difficulty
    const validDifficulties = ["beginner", "intermediate", "advanced", "expert"]
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json({ 
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}` 
      }, { status: 400 })
    }

    // Validate duration
    const validDurations = ["daily", "weekly", "monthly", "permanent"]
    if (!validDurations.includes(duration)) {
      return NextResponse.json({ 
        error: `Invalid duration. Must be one of: ${validDurations.join(", ")}` 
      }, { status: 400 })
    }

    // Validate steps structure
    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ 
        error: "Steps must be a non-empty array" 
      }, { status: 400 })
    }

    for (const step of steps) {
      if (!step.id || !step.title || !step.description || !step.target || !step.metric) {
        return NextResponse.json({ 
          error: "Each step must have: id, title, description, target, metric" 
        }, { status: 400 })
      }
    }

    // Validate rewards structure
    if (!rewards.xp || typeof rewards.xp !== 'number') {
      return NextResponse.json({ 
        error: "Rewards must include XP as a number" 
      }, { status: 400 })
    }

    // Generate unique step IDs if not provided
    const processedSteps = steps.map((step, index) => ({
      ...step,
      id: step.id || `step_${Date.now()}_${index}`,
      completed: false
    }))

    const mission = await Mission.create({
      title,
      description,
      type,
      difficulty,
      duration,
      steps: processedSteps,
      rewards,
      prerequisites: prerequisites || [],
      createdBy: session.user.id,
      isActive: true,
      participantCount: 0,
      completionCount: 0,
      aiGenerated
    })

    return NextResponse.json({ 
      success: true,
      mission: {
        id: mission._id.toString(),
        title: mission.title,
        description: mission.description,
        type: mission.type,
        difficulty: mission.difficulty,
        duration: mission.duration,
        steps: mission.steps,
        rewards: mission.rewards,
        prerequisites: mission.prerequisites,
        isActive: mission.isActive,
        createdAt: mission.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error("AI mission creation error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
  }
}