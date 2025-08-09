import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import connectDB from '@/lib/db'
import Mission from '@/models/Mission'
import MissionProgress from '@/models/MissionProgress'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user!.id
    const { id: missionId } = params

    const mission = await Mission.findById(missionId)
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Check if already joined
    const existingProgress = await MissionProgress.findOne({
      user: userId,
      mission: missionId
    })

    if (existingProgress) {
      return NextResponse.json({ error: 'Already joined this mission' }, { status: 400 })
    }

    // Create mission progress
    const progress = new MissionProgress({
      user: userId,
      mission: missionId,
      status: 'active',
      stepsCompleted: [],
      joinedAt: new Date()
    })

    await progress.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining mission:', error)
    return NextResponse.json({ error: 'Failed to join mission' }, { status: 500 })
  }
}