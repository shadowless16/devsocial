import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { AnalyticsService } from '../services/analytics.service'
import { User, Post, Activity } from '../models'
import mongoose from 'mongoose'

const router = Router()

// Middleware to check if user has analytics access (admin or analytics role)
const analyticsAccess = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'moderator' && req.user?.role !== 'analytics') {
    return res.status(403).json({ success: false, message: 'Analytics access required' })
  }
  next()
}

// GET /api/analytics/overview - Get dashboard overview
router.get('/overview', authMiddleware, analyticsAccess, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days?.toString() || '30')
    const overview = await AnalyticsService.getAnalyticsOverview(days)
    res.json({ success: true, data: overview })
  } catch (error: unknown) {
    console.error('Analytics overview error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch analytics overview' })
  }
})

// GET /api/analytics/realtime - Get real-time stats
router.get('/realtime', authMiddleware, analyticsAccess, async (req: Request, res: Response) => {
  try {
    const realTimeData = await AnalyticsService.getRealTimeAnalytics()
    res.json({ success: true, data: realTimeData })
  } catch (error: unknown) {
    console.error('Real-time analytics error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch real-time analytics' })
  }
})

// GET /api/analytics - General analytics with periods (Migration from app/api/analytics/route.ts)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const period = req.query.period?.toString() || 'week'
    const userId = req.query.userId?.toString()
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'moderator'

    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const dateFilter = { createdAt: { $gte: startDate } }
    const userFilter = isAdmin && userId ? { author: new mongoose.Types.ObjectId(userId) } : !isAdmin ? { author: new mongoose.Types.ObjectId(req.user?.id) } : {}

    const [userStats, postStats, engagementStats, topTags, dailyActivity] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            avgLevel: { $avg: '$level' },
            totalPoints: { $sum: '$points' },
            activeUsers: {
              $sum: { $cond: [{ $gte: ['$lastActive', startDate] }, 1, 0] }
            }
          }
        }
      ]),
      Post.aggregate([
        { $match: { ...dateFilter, ...userFilter } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            totalComments: { $sum: '$commentsCount' },
            avgLikesPerPost: { $avg: '$likesCount' },
            avgCommentsPerPost: { $avg: '$commentsCount' },
            totalXPAwarded: { $sum: '$xpAwarded' }
          }
        }
      ]),
      Activity.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Post.aggregate([
        { $match: { ...dateFilter, ...userFilter } },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            totalLikes: { $sum: '$likesCount' },
            totalComments: { $sum: '$commentsCount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Post.aggregate([
        { $match: { ...dateFilter, ...userFilter } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            posts: { $sum: 1 },
            likes: { $sum: '$likesCount' },
            comments: { $sum: '$commentsCount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ])

    let topPerformers = []
    if (isAdmin) {
      topPerformers = await User.aggregate([
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'posts',
            pipeline: [{ $match: dateFilter }, { $project: { likesCount: 1, commentsCount: 1, xpAwarded: 1 } }]
          }
        },
        {
          $addFields: {
            totalEngagement: {
              $sum: {
                $map: {
                  input: '$posts',
                  as: 'post',
                  in: { $add: ['$$post.likesCount', '$$post.commentsCount'] }
                }
              }
            },
            totalXP: {
              $sum: {
                $map: {
                  input: '$posts',
                  as: 'post',
                  in: '$$post.xpAwarded'
                }
              }
            },
            postCount: { $size: '$posts' }
          }
        },
        { $match: { postCount: { $gt: 0 } } },
        { $sort: { totalEngagement: -1 } },
        { $limit: 10 },
        {
          $project: {
            username: 1,
            displayName: 1,
            avatar: 1,
            level: 1,
            totalEngagement: 1,
            totalXP: 1,
            postCount: 1
          }
        }
      ])
    }

    res.json({
      success: true,
      data: {
        period,
        dateRange: { start: startDate, end: now },
        userStats: userStats[0] || { totalUsers: 0, avgLevel: 0, totalPoints: 0, activeUsers: 0 },
        postStats: postStats[0] || { totalPosts: 0, totalLikes: 0, totalComments: 0, avgLikesPerPost: 0, avgCommentsPerPost: 0, totalXPAwarded: 0 },
        engagementStats,
        topTags,
        dailyActivity,
        topPerformers
      }
    })
  } catch (error: unknown) {
    console.error('Analytics error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' })
  }
})

// GET /api/analytics/growth - Migration from existing growth sub-route
router.get('/growth', authMiddleware, analyticsAccess, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days?.toString() || '30')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ])
    
    res.json({ success: true, data: growth })
  } catch (error: unknown) {
    console.error('Growth analytics error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch growth analytics' })
  }
})

export default router
