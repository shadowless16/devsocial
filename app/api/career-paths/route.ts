import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import CareerPath from '@/models/CareerPath'
import UserProgress from '@/models/UserProgress'
import { getSession } from '@/lib/server-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const session = await getSession(request)
    const userId = session?.user?.id

    // Get all active career paths
    const paths = await CareerPath.find({ isActive: true })
      .populate('modules')
      .sort({ createdAt: 1 })

    // If user is logged in, get their progress for each path
    let pathsWithProgress = paths
    if (userId) {
      const userProgress = await UserProgress.find({ userId })
      
      pathsWithProgress = paths.map(path => {
        const progress = userProgress.find(p => p.pathId.toString() === path._id.toString())
        return {
          ...path.toObject(),
          userProgress: progress || null,
          moduleCount: path.modules.length,
          completedModules: progress ? progress.moduleProgress.filter((m: any) => m.completedAt).length : 0
        }
      })
    } else {
      pathsWithProgress = paths.map(path => ({
        ...path.toObject(),
        moduleCount: path.modules.length,
        completedModules: 0
      }))
    }

    return NextResponse.json({
      success: true,
      data: pathsWithProgress
    })
  } catch (error: any) {
    console.error('Error fetching career paths:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch career paths' },
      { status: 500 }
    )
  }
}
