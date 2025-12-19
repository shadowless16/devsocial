import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import Project from '../models/Project'
import User from '../models/User'
import Notification from '../models/Notification'
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

// GET / - List projects with filters and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '12')
    const status = req.query.status as string
    const tech = req.query.tech as string
    const author = req.query.author as string
    const featured = req.query.featured as string
    
    const skip = (page - 1) * limit
    
    // Build query
    const query: Record<string, unknown> = { visibility: 'public' }
    
    if (status) query.status = status
    if (tech) query.technologies = { $in: [tech] }
    if (author) query.author = author
    if (featured === 'true') query.featured = true
    
    const projects = await Project.find(query)
      .populate('author', 'username displayName avatar level')
      .sort({ featured: -1, createdAt: -1 } as any) // Type issue with SortOrder in Mongoose 8
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Project.countDocuments(query)
    
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Project fetch error:', errorMessage)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      details: errorMessage
    })
  }
})

// POST / - Create new project
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    const { title, description, technologies, githubUrl, liveUrl, images, openPositions, status } = req.body
    
    // Filter out empty positions
    const validPositions = (openPositions || []).filter((pos: { title?: string; description?: string }) => 
      pos.title && pos.title.trim() && pos.description && pos.description.trim()
    )
    
    const projectData = {
      title,
      description,
      technologies: technologies || [],
      githubUrl,
      liveUrl,
      images: images || [],
      openPositions: validPositions,
      status: status || 'in-progress',
      author: new mongoose.Types.ObjectId(userId)
    }
    
    const project = await Project.create(projectData)
    
    const populatedProject = await Project.findById(project._id)
      .populate('author', 'username displayName avatar level')
      .lean()
    
    // Award XP/Points for creating project
    await User.findByIdAndUpdate(userId, {
      $inc: { points: 50 }
    })
    
    res.json({
      success: true,
      data: populatedProject
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Project creation error:', errorMessage)
    
    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors.join(', ')
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
      details: errorMessage
    })
  }
})

// GET /:id - Get single project with view tracking
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    
    const project = await Project.findById(id)
      .populate('author', 'username displayName avatar level')
      .lean()
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }
    
    // Increment view count only if user hasn't viewed before
    if (userId) {
      const userObjectId = new mongoose.Types.ObjectId(userId)
      const hasViewed = project.viewedBy?.some((viewId) => viewId.toString() === userId)
      if (!hasViewed) {
        await Project.findByIdAndUpdate(id, {
          $inc: { views: 1 },
          $addToSet: { viewedBy: userObjectId }
        })
        // Update local object for response
        if ('views' in project) project.views = (project.views as number || 0) + 1
      }
    }
    
    res.json({
      success: true,
      data: project
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Project fetch error:', errorMessage)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    })
  }
})

// PUT /:id - Update project
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    const { id } = req.params
    
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }
    
    if (project.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to edit this project'
      })
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username displayName avatar level')
    
    res.json({
      success: true,
      data: updatedProject
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Project update error:', errorMessage)
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    })
  }
})

// DELETE /:id - Delete project
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    const { id } = req.params
    
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }
    
    if (project.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this project'
      })
    }
    
    await Project.findByIdAndDelete(id)
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Project deletion error:', errorMessage)
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    })
  }
})

// POST /:id/like - Like/unlike project
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }
    
    const { id } = req.params
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userId)
    const isLiked = project.likes.some(likeId => likeId.toString() === userId)
    
    if (isLiked) {
      // Unlike
      await Project.findByIdAndUpdate(id, {
        $pull: { likes: userObjectId }
      })
    } else {
      // Like
      await Project.findByIdAndUpdate(id, {
        $addToSet: { likes: userObjectId }
      })
      
      // Award XP to project author (not the liker)
      if (project.author.toString() !== userId) {
        await User.findByIdAndUpdate(project.author, {
          $inc: { points: 5 }
        })
        
        // Create notification for project author
        await Notification.create({
          recipient: project.author,
          sender: userObjectId,
          type: 'project_like',
          title: 'Project Liked',
          message: `Someone liked your project "${project.title}"`,
          relatedProject: project._id,
          actionUrl: `/projects/${project._id}`
        })
      }
    }
    
    const updatedProject = await Project.findById(id)
      .populate('author', 'username displayName avatar level')
      .lean()
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found after update'
      })
    }
    
    res.json({
      success: true,
      data: {
        project: updatedProject,
        isLiked: !isLiked,
        likesCount: (updatedProject as any).likes?.length || 0
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Toggle like error:', errorMessage)
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like'
    })
  }
})

export default router

