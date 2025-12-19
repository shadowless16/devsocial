import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { User, Post, Feedback } from '../models'
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
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

// GET /api/admin/users - List all users with stats
router.get('/users', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter?.toString() || 'all'
    const page = parseInt(req.query.page?.toString() || '1')
    const limit = parseInt(req.query.limit?.toString() || '50')
    const skip = (page - 1) * limit

    const query: Record<string, any> = {}
    if (filter === 'blocked') query.isBlocked = true
    if (filter === 'active') query.isBlocked = false
    if (filter === 'moderators') query.role = 'moderator'
    if (filter === 'admins') query.role = 'admin'

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('username displayName email avatar level points role isBlocked createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ])

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id })
        return {
          ...user,
          postsCount
        }
      })
    )

    res.json({
      success: true,
      data: { 
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Admin users fetch error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch users' })
  }
})

// GET /api/admin/users/:userId - Get single user details for admin
router.get('/users/:userId', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const [postsCount, recentPosts] = await Promise.all([
      Post.countDocuments({ author: userId }),
      Post.find({ author: userId }).sort({ createdAt: -1 }).limit(10).select('content createdAt points').lean()
    ])

    res.json({
      success: true,
      data: {
        ...user,
        stats: { postsCount },
        recentActivity: recentPosts.map(p => ({
          type: 'Post Created',
          description: p.content.substring(0, 100),
          timestamp: p.createdAt,
          xp: (p as any).points || 0
        }))
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('User detail fetch error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch user details' })
  }
})

// POST /api/admin/users/:userId/block - Block/unblock user
router.post('/users/:userId/block', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.isBlocked = !user.isBlocked
    await user.save()

    res.json({
      success: true,
      data: { isBlocked: user.isBlocked },
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Block user error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to toggle block status' })
  }
})

// PATCH /api/admin/users/:userId/xp - Update user XP/Points
router.patch('/users/:userId/xp', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { amount, action } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (action === 'add') {
      user.points += amount
    } else if (action === 'remove') {
      user.points = Math.max(0, user.points - amount)
    } else if (action === 'set') {
      user.points = amount
    }

    user.level = Math.floor(user.points / 1000) + 1
    await user.save()

    res.json({
      success: true,
      data: { points: user.points, level: user.level },
      message: 'XP updated successfully'
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('XP update error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to update XP' })
  }
})

// POST /api/admin/assign-role - Assign role to user
router.post('/assign-role', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requesterId = req.user?.id
    const requesterRole = req.user?.role
    const { userId, role } = req.body

    // Only admins can assign most roles. Users can assign 'analytics' to themselves for dev purposes if needed.
    if (requesterRole !== 'admin' && role !== 'analytics') {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    
    if (requesterRole !== 'admin' && userId !== requesterId) {
      return res.status(403).json({ success: false, message: 'Can only assign analytics role to yourself' })
    }

    const validRoles = ['user', 'moderator', 'admin', 'analytics']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.role = role
    await user.save()

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Role assignment error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to assign role' })
  }
})

// GET /api/admin/feedback - List all feedback
router.get('/feedback', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const status = req.query.status?.toString()
    const type = req.query.type?.toString()
    
    const query: Record<string, any> = {}
    if (status) query.status = status
    if (type) query.type = type
    
    const feedbacks = await Feedback.find(query)
      .populate('userId', 'username avatar email')
      .populate('solvedBy', 'username')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, feedback: feedbacks })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Admin feedback fetch error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' })
  }
})

// PATCH /api/admin/feedback - Update feedback status
router.patch('/feedback', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { feedbackId, status, adminResponse } = req.body

    if (!feedbackId || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const updateData: Record<string, any> = { 
      status,
      updatedAt: new Date()
    }

    if (status === 'solved') {
      updateData.solvedBy = req.user?.id
      updateData.solvedAt = new Date()
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    ).populate('userId', 'username avatar email')
     .populate('solvedBy', 'username')

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' })
    }

    res.json({ success: true, feedback })
  } catch (error: unknown) {
    const errorMessage = isApiError(error) ? error.message : 'Operation failed'
    console.error('Admin feedback update error:', errorMessage)
    res.status(500).json({ success: false, message: 'Failed to update feedback' })
  }
})

export default router

