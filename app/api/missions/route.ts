import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Mission from "@/models/Mission"
import MissionProgress from "@/models/MissionProgress"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Follow from "@/models/Follow"
import Post from "@/models/Post"
import Like from "@/models/Like"
import Comment from "@/models/Comment"
import User from "@/models/User"

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

    const missionsWithProgress = await Promise.all(missions.map(async mission => {
      const userProgressData = progressMap.get(mission._id.toString())
      
      // Calculate current progress for each step
      const progressWithCounts = userProgressData ? {
        ...userProgressData.toObject(),
        progress: await Promise.all(mission.steps.map(async (step: any) => {
          const stepId = step.id || step._id?.toString()
          let current = 0
          
          // Calculate current progress based on step type
          const stepText = ((step.title || '') + ' ' + (step.description || '')).toLowerCase()
          
          if (stepText.includes('follow') && (stepText.includes('user') || stepText.includes('developer'))) {
            current = await Follow.countDocuments({ follower: session.user.id })
          } else if (stepText.includes('post') && (stepText.includes('create') || stepText.includes('share'))) {
            current = await Post.countDocuments({ author: session.user.id })
          } else if (stepText.includes('like')) {
            current = await Like.countDocuments({ user: session.user.id })
          } else if (stepText.includes('comment')) {
            current = await Comment.countDocuments({ author: session.user.id })
          } else if (stepText.includes('follower') || stepText.includes('gain')) {
            // For "Gain X Followers" steps - count actual followers
            current = await Follow.countDocuments({ following: session.user.id })
          }
          
          return {
            stepId,
            current,
            target: step.target || 1,
            completed: userProgressData.stepsCompleted.includes(stepId)
          }
        }))
      } : null
      
      return {
        ...mission.toObject(),
        id: mission._id.toString(),
        userProgress: progressWithCounts
      }
    }))

    return NextResponse.json({ 
      success: true,
      data: { missions: missionsWithProgress }
    })
  } catch (error) {
    console.error("Get missions error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 })
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