import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/core/db'
import CareerPath from '@/models/CareerPath'
import Module from '@/models/Module'
import UserProgress from '@/models/UserProgress'
import { getSession } from '@/lib/auth/server-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authOptions } from '@/lib/auth/auth'
import mongoose from 'mongoose'

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
    const isValidObjectId = mongoose.Types.ObjectId.isValid(pathId)
    const query: Record<string, unknown> = { slug: pathId, isActive: true }
    if (isValidObjectId) {
      query.$or = [{ slug: pathId }, { _id: pathId }]
      delete query.slug
    }
    const path = await CareerPath.findOne(query)

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
    let userProgress: unknown = null
    let modulesWithProgress = modules
    
    if (userId) {
      userProgress = await UserProgress.findOne({ 
        userId, 
        pathId: path._id 
      })

      // Add progress info to each module
      modulesWithProgress = modules.map(module => {
        const userProgressData = userProgress as { moduleProgress?: Array<{ moduleId: { toString: () => string }; completedAt?: Date }> } | null
        const moduleProgress = userProgressData?.moduleProgress?.find(
(mp) => mp.moduleId.toString() === module._id.toString()
        )
        
        return {
          ...module.toObject(),
          isCompleted: !!moduleProgress?.completedAt,
          userProgress: moduleProgress || null
        }
      }) as any[]
    } else {
      modulesWithProgress = modules.map(module => ({
        ...module.toObject(),
        isCompleted: false,
        userProgress: null
      })) as any[]
    }

    const pathData = {
      ...path.toObject(),
      modules: modulesWithProgress,
      userProgress,
      moduleCount: modules.length,
      completedModules: userProgress ? 
        ((userProgress as { moduleProgress?: Array<{ completedAt?: Date }> }).moduleProgress?.filter((m) => m.completedAt).length || 0) : 0
    }

    return NextResponse.json({
      success: true,
      data: pathData
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Error fetching career path:', errorMessage)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch career path' },
      { status: 500 }
    )
  }
}