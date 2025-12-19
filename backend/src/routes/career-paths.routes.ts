import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { CareerPath, Module, UserProgress, User } from '../models'
import mongoose from 'mongoose'

const router = Router()

interface ApiError {
  message: string
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

// GET /api/career-paths/ - List all career paths
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    // Get all active career paths
    const paths = await CareerPath.find({ isActive: true })
      .populate('modules')
      .sort({ createdAt: 1 } as any)

    // If user is logged in, get their progress for each path
    let pathsWithProgress = []
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

    res.json({
      success: true,
      data: pathsWithProgress
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching career paths:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career paths'
    })
  }
})

// GET /api/career-paths/:pathId - Get single career path
router.get('/:pathId', async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params
    const userId = req.user?.id

    // Get career path by slug or ID
    const isValidObjectId = mongoose.Types.ObjectId.isValid(pathId)
    const query: Record<string, any> = { slug: pathId, isActive: true }
    if (isValidObjectId) {
      query.$or = [{ slug: pathId }, { _id: pathId }]
      delete query.slug
    }
    const path = await CareerPath.findOne(query)

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      })
    }

    // Get all modules for this path
    const modules = await Module.find({ 
      pathId: path._id, 
      isActive: true 
    }).sort({ order: 1 } as any)

    // Get user progress if logged in
    let userProgress = null
    let modulesWithProgress = []
    
    if (userId) {
      userProgress = await UserProgress.findOne({ 
        userId, 
        pathId: path._id 
      })

      // Add progress info to each module
      modulesWithProgress = modules.map(module => {
        const moduleProgress = userProgress?.moduleProgress?.find(
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
        (userProgress.moduleProgress?.filter((m: any) => m.completedAt).length || 0) : 0
    }

    res.json({
      success: true,
      data: pathData
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching career path:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch career path'
    })
  }
})

// GET /api/career-paths/:pathId/:moduleId - Get specific module
router.get('/:pathId/:moduleId', async (req: Request, res: Response) => {
  try {
    const { pathId, moduleId } = req.params
    const userId = req.user?.id

    const path = await CareerPath.findOne({
      $or: [{ slug: pathId }, { _id: pathId }] as any,
      isActive: true
    })

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      })
    }

    const moduleData = await Module.findOne({
      $or: [{ slug: moduleId }, { _id: moduleId }] as any,
      pathId: path._id,
      isActive: true
    })

    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      })
    }

    let userProgress = null
    let moduleProgress = null
    
    if (userId) {
      userProgress = await UserProgress.findOne({ 
        userId, 
        pathId: path._id 
      })

      moduleProgress = userProgress?.moduleProgress.find(
        (mp: any) => mp.moduleId.toString() === moduleData._id.toString()
      )
    }

    const allModules = await Module.find({ 
      pathId: path._id, 
      isActive: true 
    }).sort({ order: 1 } as any).select('_id title slug order')

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

    res.json({
      success: true,
      data: responseData
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error fetching module:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch module'
    })
  }
})

// POST /api/career-paths/:pathId/:moduleId - Complete module
router.post('/:pathId/:moduleId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { pathId, moduleId } = req.params
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const path = await CareerPath.findOne({
      $or: [{ slug: pathId }, { _id: pathId }] as any,
      isActive: true
    })

    if (!path) {
      return res.status(404).json({ success: false, message: 'Career path not found' })
    }

    const moduleData = await Module.findOne({
      $or: [{ slug: moduleId }, { _id: moduleId }] as any,
      pathId: path._id,
      isActive: true
    })

    if (!moduleData) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }

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

    const existingProgress = userProgress.moduleProgress.find(
      (mp: any) => mp.moduleId.toString() === moduleData._id.toString()
    )

    if (existingProgress && existingProgress.completedAt) {
      return res.json({
        success: true,
        message: 'Module already completed',
        data: userProgress
      })
    }

    if (existingProgress) {
      existingProgress.completedAt = new Date()
    } else {
      userProgress.moduleProgress.push({
        moduleId: moduleData._id,
        completedAt: new Date(),
        timeSpent: 0
      })
    }

    const totalModules = await Module.countDocuments({ pathId: path._id, isActive: true })
    const completedModules = userProgress.moduleProgress.filter((m: any) => m.completedAt).length
    
    userProgress.completionPercentage = (completedModules / totalModules) * 100
    userProgress.totalXpEarned += moduleData.xpReward
    userProgress.lastAccessedAt = new Date()

    if (completedModules === totalModules && !userProgress.completedAt) {
      userProgress.completedAt = new Date()
    }

    await userProgress.save()

    // Award XP/Points to user's main profile
    await User.findByIdAndUpdate(userId, {
      $inc: { points: moduleData.xpReward }
    })

    res.json({
      success: true,
      message: 'Module completed successfully',
      data: {
        xpEarned: moduleData.xpReward,
        completionPercentage: userProgress.completionPercentage,
        pathCompleted: !!userProgress.completedAt
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Error completing module:', errorMessage)
    res.status(500).json({
      success: false,
      message: 'Failed to complete module'
    })
  }
})

export default router

