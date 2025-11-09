import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CareerPath from '@/models/CareerPath'
import Module from '@/models/Module'
import UserProgress from '@/models/UserProgress'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'

interface Props {
  params: Promise<{ pathId: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    await connectDB()
    
    const { pathId } = await params
    const session = await getSession(request)
    const userId = session?.user?.id

    // Get career path by slug or ID
    const path = await CareerPath.findOne({
      $or: [{ slug: pathId }, { _id: pathId }],
      isActive: true
    })

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Career path not found' },
        { status: 404 }
      )
    }

    // Get all modules for this path
    const modules = await Module.find({ 
      pathId: path._id, 
      isActive: true 
    }).sort({ order: 1 })

    // Get user progress if logged in
    let userProgress: any = null
    let modulesWithProgress = modules
    
    if (userId) {
      userProgress = await UserProgress.findOne({ 
        userId, 
        pathId: path._id 
      })

      // Add progress info to each module
      modulesWithProgress = modules.map(module => {
        const moduleProgress = userProgress?.moduleProgress.find(
(mp: any) => mp.moduleId.toString() === module._id.toString()
        )
        
        return {
          ...module.toObject(),
          isCompleted: !!moduleProgress?.completedAt,
          userProgress: moduleProgress || null
        }
      })
    } else {
      modulesWithProgress = modules.map(module => ({
        ...module.toObject(),
        isCompleted: false,
        userProgress: null
      }))
    }

    const pathData = {
      ...path.toObject(),
      modules: modulesWithProgress,
      userProgress,
      moduleCount: modules.length,
      completedModules: userProgress ? 
        userProgress.moduleProgress.filter((m: any) => m.completedAt).length : 0
    }

    return NextResponse.json({
      success: true,
      data: pathData
    })
  } catch (error: any) {
    console.error('Error fetching career path:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch career path' },
      { status: 500 }
    )
  }
}