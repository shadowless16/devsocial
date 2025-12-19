import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import Module from '@/models/Module'
import CareerPath from '@/models/CareerPath'
import UserProgress from '@/models/UserProgress'
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from '@/lib/auth/auth'

interface Props {
  params: Promise<{ pathId: string; moduleId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    await connectDB()
    
    const { pathId, moduleId } = await params
    const session = await getSession(request)
    const userId = session?.user?.id

    // Get career path first
    const path = await CareerPath.findOne({
      $or: [{ slug: pathId }, { _id: pathId }] as never,
      isActive: true
    })

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Career path not found' },
        { status: 404 }
      )
    }

    // Get module by slug or ID
    const moduleData = await Module.findOne({
      $or: [{ slug: moduleId }, { _id: moduleId }] as never,
      pathId: path._id,
      isActive: true
    })

    if (!moduleData) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      )
    }

    // Get user progress if logged in
    let userProgress = null
    let moduleProgress = null
    
    if (userId) {
      userProgress = await UserProgress.findOne({ 
        userId, 
        pathId: path._id 
      })

      moduleProgress = userProgress?.moduleProgress.find(
(mp: { moduleId: { toString: () => string } }) => mp.moduleId.toString() === moduleData._id.toString()
      )
    }

    // Get all modules for navigation
    const allModules = await Module.find({ 
      pathId: path._id, 
      isActive: true 
    }).sort({ order: 1 }).select('_id title slug order')

    const responseData = {
      ...moduleData.toObject(),
      isCompleted: !!moduleProgress?.completedAt,
      userProgress: moduleProgress || null,
      path: {
        _id: path._id,
        title: path.title,
        slug: path.slug
      },
      allModules
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error fetching module:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch module' },
      { status: 500 }
    )
  }
}

// Mark module as complete
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await connectDB()
    
    const { pathId, moduleId } = await params
    const session = await getSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get career path and module
    const path = await CareerPath.findOne({
      $or: [{ slug: pathId }, { _id: pathId }] as never,
      isActive: true
    })

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Career path not found' },
        { status: 404 }
      )
    }

    const moduleData = await Module.findOne({
      $or: [{ slug: moduleId }, { _id: moduleId }] as never,
      pathId: path._id,
      isActive: true
    })

    if (!moduleData) {
      return NextResponse.json(
        { success: false, message: 'Module not found' },
        { status: 404 }
      )
    }

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ 
      userId, 
      pathId: path._id 
    })

    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        pathId: path._id,
        moduleProgress: []
      })
    }

    // Check if module is already completed
    const existingProgress = userProgress.moduleProgress.find(
(mp: { moduleId: { toString: () => string }; completedAt?: Date }) => mp.moduleId.toString() === moduleData._id.toString()
    )

    if (existingProgress && existingProgress.completedAt) {
      return NextResponse.json({
        success: true,
        message: 'Module already completed',
        data: userProgress
      })
    }

    // Mark module as complete
    if (existingProgress) {
      existingProgress.completedAt = new Date()
    } else {
      userProgress.moduleProgress.push({
        moduleId: moduleData._id,
        completedAt: new Date(),
        timeSpent: 0
      })
    }

    // Update progress stats
    const completedModules = userProgress.moduleProgress.filter((m: { completedAt?: Date }) => m.completedAt).length
    const totalModules = await Module.countDocuments({ pathId: path._id, isActive: true })
    
    userProgress.completionPercentage = (completedModules / totalModules) * 100
    userProgress.totalXpEarned += moduleData.xpReward
    userProgress.lastAccessedAt = new Date()

    // Check if path is completed
    if (completedModules === totalModules && !userProgress.completedAt) {
      userProgress.completedAt = new Date()
    }

    await userProgress.save()

    // TODO: Award XP to user's main profile
    // This would integrate with your existing XP system

    return NextResponse.json({
      success: true,
      message: 'Module completed successfully',
      data: {
        xpEarned: moduleData.xpReward,
        completionPercentage: userProgress.completionPercentage,
        pathCompleted: !!userProgress.completedAt
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error completing module:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to complete module' },
      { status: 500 }
    )
  }
}