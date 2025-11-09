import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { MissionTracker } from "@/utils/mission-tracker"
import { getSession } from '@/lib/server-auth'
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { metric, increment = 1, metadata } = body

    if (!metric) {
      return NextResponse.json({ 
        error: "Metric is required" 
      }, { status: 400 })
    }

    // Valid metrics for mission tracking
    const validMetrics = [
      "follows", "followers", "posts", "likes_given", "likes_received", 
      "comments", "code_posts", "challenges_completed", "projects_shared",
      "mentoring_sessions", "level", "hashtag_usage"
    ]

    if (!validMetrics.includes(metric)) {
      return NextResponse.json({ 
        error: `Invalid metric. Must be one of: ${validMetrics.join(", ")}` 
      }, { status: 400 })
    }

    await MissionTracker.updateProgress(session.user.id, metric, increment, metadata)

    return NextResponse.json({ 
      success: true,
      message: `Progress updated for metric: ${metric}` 
    })
  } catch (error) {
    console.error("Mission tracking error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userMissions = await MissionTracker.getUserMissions(session.user.id)
    const availableMissions = await MissionTracker.getAvailableMissions(session.user.id)

    return NextResponse.json({ 
      success: true,
      data: {
        userMissions,
        availableMissions
      }
    })
  } catch (error) {
    console.error("Get mission tracking error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
  }
}
