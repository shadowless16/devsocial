import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import Feedback from '../models/Feedback'
import FeedbackComment from '../models/FeedbackComment'
import User from '../models/User'
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

// POST / - Create feedback
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { type, subject, description, rating } = req.body

    if (!type || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const feedback = new Feedback({
      userId,
      type,
      subject,
      description,
      rating: rating ? parseInt(rating) : undefined
    })

    await feedback.save()

    res.json({ success: true, id: feedback._id })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Feedback submission error:', errorMessage)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET / - List feedback
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const view = req.query.view?.toString() || 'my'
    
    let query: Record<string, unknown> = {}
    if (view === 'my') {
      query = { userId: new mongoose.Types.ObjectId(userId) }
    }
    
    const feedback = await Feedback.find(query)
      .populate('userId', 'username avatar role')
      .populate('solvedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ feedback })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Feedback fetch error:', errorMessage)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /:id - Get single feedback with comments
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    
    const feedback = await Feedback.findById(id)
      .populate('userId', 'username avatar role')
      .populate('solvedBy', 'username')

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    // Get comments
    const comments = await FeedbackComment.find({ feedbackId: id })
      .populate('userId', 'username avatar role')
      .sort({ createdAt: 1 })

    res.json({ feedback, comments })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Feedback fetch error:', errorMessage)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /:id - Update feedback status (admin/moderator only)
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    
    const user = await User.findById(userId)
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { status } = req.body

    const validStatuses = ['open', 'in-progress', 'solved']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const updateData: Record<string, unknown> = { status }
    if (status === 'solved') {
      updateData.solvedBy = userId
      updateData.solvedAt = new Date()
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'username avatar role')
     .populate('solvedBy', 'username')

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    res.json({ feedback })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Feedback update error:', errorMessage)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /:id/comments - Add comment to feedback
router.post('/:id/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { content } = req.body
    const { id } = req.params

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    // Check if feedback exists
    const feedback = await Feedback.findById(id)
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' })
    }

    // Check if user can comment (feedback owner or admin/moderator)
    const user = await User.findById(userId)
    const canComment = feedback.userId.toString() === userId || 
                      user?.role === 'admin' || 
                      user?.role === 'moderator'

    if (!canComment) {
      return res.status(403).json({ error: 'Not authorized to comment on this feedback' })
    }

    const comment = new FeedbackComment({
      feedbackId: id,
      userId,
      content: content.trim(),
      isAdminComment: user?.role === 'admin' || user?.role === 'moderator'
    })

    await comment.save()

    // Update comments count
    await Feedback.findByIdAndUpdate(id, {
      $inc: { commentsCount: 1 }
    })

    // Populate the comment before returning
    await comment.populate('userId', 'username avatar role')

    res.json({ comment })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Comment creation error:', errorMessage)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

