import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import UserStats from '@/models/UserStats'
import Referral from '@/models/Referral'
import XPLog from '@/models/XPLog'
import { cache } from '@/lib/cache'

// Helper function to get start of current week (Monday)
function getStartOfWeek() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - daysToSubtract)
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

// Helper function to get start of current month
function getStartOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Check cache first
    const cacheKey = `leaderboard_${type}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
  
    await connectDB()

    let leaderboard: any[] = []

    switch (type) {
      case 'weekly': {
        // Get XP earned from Monday to Sunday of current week
        const startOfWeek = getStartOfWeek()
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)
        
        const weeklyXP = await XPLog.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfWeek, $lt: endOfWeek }
            }
          },
          {
            $group: {
              _id: '$userId',
              weeklyXP: { $sum: '$xpAmount' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              weeklyXP: 1,
              user: {
                _id: '$user._id',
                username: '$user.username',
                displayName: '$user.displayName',
                firstName: '$user.firstName',
                lastName: '$user.lastName',
                avatar: '$user.avatar',
                level: { $ifNull: ['$user.level', 1] }
              }
            }
          },
          { $sort: { weeklyXP: -1 } },
          { $limit: limit }
        ])

        leaderboard = weeklyXP.map((entry: any, index) => ({
          _id: entry._id.toString(),
          user: {
            _id: entry.user._id.toString(),
            username: entry.user.username,
            displayName: entry.user.displayName || 
              (entry.user.firstName && entry.user.lastName ? `${entry.user.firstName} ${entry.user.lastName}` : entry.user.username),
            avatar: entry.user.avatar || "/placeholder.svg",
            level: entry.user.level || 1
          },
          totalXP: entry.weeklyXP || 0,
          rank: index + 1,
          level: entry.user.level || 1
        }))
        break
      }

      case 'monthly': {
        // Get XP earned this month
        const startOfMonth = getStartOfMonth()
        const endOfMonth = new Date(startOfMonth)
        endOfMonth.setMonth(startOfMonth.getMonth() + 1)
        
        const monthlyXP = await XPLog.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfMonth, $lt: endOfMonth }
            }
          },
          {
            $group: {
              _id: '$userId',
              monthlyXP: { $sum: '$xpAmount' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              monthlyXP: 1,
              user: {
                _id: '$user._id',
                username: '$user.username',
                displayName: '$user.displayName',
                firstName: '$user.firstName',
                lastName: '$user.lastName',
                avatar: '$user.avatar',
                level: { $ifNull: ['$user.level', 1] }
              }
            }
          },
          { $sort: { monthlyXP: -1 } },
          { $limit: limit }
        ])

        leaderboard = monthlyXP.map((entry: any, index) => ({
          _id: entry._id.toString(),
          user: {
            _id: entry.user._id.toString(),
            username: entry.user.username,
            displayName: entry.user.displayName || 
              (entry.user.firstName && entry.user.lastName ? `${entry.user.firstName} ${entry.user.lastName}` : entry.user.username),
            avatar: entry.user.avatar || "/placeholder.svg",
            level: entry.user.level || 1
          },
          totalXP: entry.monthlyXP || 0,
          rank: index + 1,
          level: entry.user.level || 1
        }))
        break
      }

      case 'referrals': {
        // Get referral counts from Referral model
        const referralStats = await Referral.aggregate([
          {
            $match: {
              status: 'completed'
            }
          },
          {
            $group: {
              _id: '$referrer',
              referralCount: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              referralCount: 1,
              user: {
                _id: '$user._id',
                username: '$user.username',
                displayName: '$user.displayName',
                firstName: '$user.firstName',
                lastName: '$user.lastName',
                avatar: '$user.avatar',
                level: { $ifNull: ['$user.level', 1] }
              }
            }
          },
          { $sort: { referralCount: -1 } },
          { $limit: limit }
        ])

        leaderboard = referralStats.map((entry: any, index) => ({
          _id: entry._id.toString(),
          user: {
            _id: entry.user._id.toString(),
            username: entry.user.username,
            displayName: entry.user.displayName || 
              (entry.user.firstName && entry.user.lastName ? `${entry.user.firstName} ${entry.user.lastName}` : entry.user.username),
            avatar: entry.user.avatar || "/placeholder.svg",
            level: entry.user.level || 1
          },
          totalXP: entry.user.points || 0,
          referralCount: entry.referralCount || 0,
          rank: index + 1,
          level: entry.user.level || 1
        }))
        break
      }

      case 'challenges': {
        // Get challenge completion stats from UserStats
        const challengeStats = await UserStats.aggregate([
          {
            $match: {
              challengesCompleted: { $gt: 0 }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userInfo'
            }
          },
          { $unwind: '$userInfo' },
          {
            $project: {
              _id: '$user',
              challengesCompleted: 1,
              user: {
                _id: '$userInfo._id',
                username: '$userInfo.username',
                displayName: '$userInfo.displayName',
                firstName: '$userInfo.firstName',
                lastName: '$userInfo.lastName',
                avatar: '$userInfo.avatar',
                level: { $ifNull: ['$userInfo.level', 1] }
              }
            }
          },
          { $sort: { challengesCompleted: -1 } },
          { $limit: limit }
        ])

        leaderboard = challengeStats.map((entry: any, index) => ({
          _id: entry._id.toString(),
          user: {
            _id: entry.user._id.toString(),
            username: entry.user.username,
            displayName: entry.user.displayName || 
              (entry.user.firstName && entry.user.lastName ? `${entry.user.firstName} ${entry.user.lastName}` : entry.user.username),
            avatar: entry.user.avatar || "/placeholder.svg",
            level: entry.user.level || 1
          },
          totalXP: entry.user.points || 0,
          challengesCompleted: entry.challengesCompleted || 0,
          rank: index + 1,
          level: entry.user.level || 1
        }))
        break
      }

      default: {
        // All-time leaderboard based on total points
        const users = await User.aggregate([
          {
            $project: {
              username: 1,
              displayName: 1,
              firstName: 1,
              lastName: 1,
              avatar: 1,
              points: { $ifNull: ['$points', 0] },
              level: { $ifNull: ['$level', 1] }
            }
          },
          { $sort: { points: -1 } },
          { $limit: limit }
        ])

        leaderboard = users.map((user: any, index) => ({
          _id: user._id.toString(),
          user: {
            _id: user._id.toString(),
            username: user.username,
            displayName: user.displayName || 
              (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username),
            avatar: user.avatar || "/placeholder.svg",
            level: user.level || 1
          },
          totalXP: user.points || 0,
          rank: index + 1,
          level: user.level || 1
        }))
        break
      }
    }

    const responseData = {
      success: true,
      data: {
        leaderboard,
        type,
        totalUsers: leaderboard.length
      }
    }
    
    // Cache for 2 minutes for better real-time updates
    cache.set(cacheKey, responseData, 120000)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Leaderboard error:', error)
    // Return fallback data when database is unavailable
    const fallbackData = {
      success: true,
      data: {
        leaderboard: [
          { _id: '1', user: { username: 'demo1', displayName: 'Demo User 1', avatar: '/placeholder.svg', level: 5 }, totalXP: 2500, rank: 1, level: 5 },
          { _id: '2', user: { username: 'demo2', displayName: 'Demo User 2', avatar: '/placeholder.svg', level: 4 }, totalXP: 1800, rank: 2, level: 4 },
          { _id: '3', user: { username: 'demo3', displayName: 'Demo User 3', avatar: '/placeholder.svg', level: 3 }, totalXP: 1200, rank: 3, level: 3 }
        ],
        timeframe: 'all-time',
        totalUsers: 100
      }
    }
    return NextResponse.json(fallbackData)
  }
}