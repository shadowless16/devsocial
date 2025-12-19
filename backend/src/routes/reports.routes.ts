import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { Report, Post } from '../models'
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

// Middleware to check if user is admin
const adminOnly = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
    return res.status(403).json({ success: false, message: 'Admin/Moderator access required' })
  }
  next()
}

// GET /api/reports - List all reports (Admin/Mod only)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const status = req.query.status?.toString() || 'pending'

    const reports = await Report.find({ status })
      .populate('reporter', 'username displayName avatar')
      .populate('reportedUser', 'username displayName avatar')
      .populate('reportedPost', 'content')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      data: { reports }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Reports fetch error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch reports' })
  }
})

// POST /api/reports - Create new report (User)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { postId, reason, description } = req.body

    if (!postId || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    // Check if user already reported this post
    const existingReport = await Report.findOne({
      reporter: new mongoose.Types.ObjectId(userId),
      reportedPost: new mongoose.Types.ObjectId(postId)
    })

    if (existingReport) {
      return res.status(400).json({ success: false, message: 'You have already reported this post' })
    }

    // Get the post to find the reported user
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    const report = await Report.create({
      reporter: new mongoose.Types.ObjectId(userId),
      reportedUser: post.author,
      reportedPost: new mongoose.Types.ObjectId(postId),
      reason,
      description: description || '',
      status: 'pending'
    })

    res.json({
      success: true,
      data: { report }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Report creation error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to create report' })
  }
})

// PUT /api/reports/:id - Update report status (Admin/Mod only)
router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { action, status } = req.body
    const userId = req.user?.id

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status,
        reviewedBy: new mongoose.Types.ObjectId(userId),
        reviewedAt: new Date(),
        action
      },
      { new: true }
    )

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    // Handle post removal if action is post_removed
    if (action === 'post_removed') {
      await Post.findByIdAndDelete(report.reportedPost)
    }

    res.json({
      success: true,
      data: { report }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Report update error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to update report' })
  }
})

export default router
