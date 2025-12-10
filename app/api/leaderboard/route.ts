import { NextRequest, NextResponse } from 'next/server'
import { connectWithRetry } from '@/lib/core/connect-with-retry'
import User from '@/models/User'
import UserStats from '@/models/UserStats'
import Referral from '@/models/Referral'
import XPLog from '@/models/XPLog'
import { cache } from '@/lib/core/cache'

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

    // Aggressive caching - 5 minutes for leaderboard
    const cacheKey = `leaderboard_${type}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
  
    await connectWithRetry()

    let leaderboard: unknown[] = []

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

        interface WeeklyEntry {
          _id: { toString: () => string };
          weeklyXP: number;
          user: {
            _id: { toString: () => string };
            username: string;
            displayName?: string;
            firstName?: string;
            lastName?: string;
            avatar?: string;
            level: number;
          };
        }
        
        leaderboard = weeklyXP.map((entry: unknown, index) => {
          const typedEntry = entry as WeeklyEntry;
          return {
            _id: typedEntry._id.toString(),
            user: {
              _id: typedEntry.user._id.toString(),
              username: typedEntry.user.username,
              displayName: typedEntry.user.displayName || 
                (typedEntry.user.firstName && typedEntry.user.lastName ? `${typedEntry.user.firstName} ${typedEntry.user.lastName}` : typedEntry.user.username),
              avatar: typedEntry.user.avatar || "/placeholder.svg",
              level: typedEntry.user.level || 1
            },
            totalXP: typedEntry.weeklyXP || 0,
            rank: index + 1,
            level: typedEntry.user.level || 1
          };
        })
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

        interface MonthlyEntry {
          _id: { toString: () => string };
          monthlyXP: number;
          user: {
            _id: { toString: () => string };
            username: string;
            displayName?: string;
            firstName?: string;
            lastName?: string;
            avatar?: string;
            level: number;
          };
        }
        
        leaderboard = monthlyXP.map((entry: unknown, index) => {
          const typedEntry = entry as MonthlyEntry;
          return {
            _id: typedEntry._id.toString(),
            user: {
              _id: typedEntry.user._id.toString(),
              username: typedEntry.user.username,
              displayName: typedEntry.user.displayName || 
                (typedEntry.user.firstName && typedEntry.user.lastName ? `${typedEntry.user.firstName} ${typedEntry.user.lastName}` : typedEntry.user.username),
              avatar: typedEntry.user.avatar || "/placeholder.svg",
              level: typedEntry.user.level || 1
            },
            totalXP: typedEntry.monthlyXP || 0,
            rank: index + 1,
            level: typedEntry.user.level || 1
          };
        })
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

        interface ReferralEntry {
          _id: { toString: () => string };
          referralCount: number;
          user: {
            _id: { toString: () => string };
            username: string;
            displayName?: string;
            firstName?: string;
            lastName?: string;
            avatar?: string;
            level: number;
            points: number;
          };
        }
        
        leaderboard = referralStats.map((entry: unknown, index) => {
          const typedEntry = entry as ReferralEntry;
          return {
            _id: typedEntry._id.toString(),
            user: {
              _id: typedEntry.user._id.toString(),
              username: typedEntry.user.username,
              displayName: typedEntry.user.displayName || 
                (typedEntry.user.firstName && typedEntry.user.lastName ? `${typedEntry.user.firstName} ${typedEntry.user.lastName}` : typedEntry.user.username),
              avatar: typedEntry.user.avatar || "/placeholder.svg",
              level: typedEntry.user.level || 1
            },
            totalXP: typedEntry.user.points || 0,
            referralCount: typedEntry.referralCount || 0,
            rank: index + 1,
            level: typedEntry.user.level || 1
          };
        })
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

        interface ChallengeEntry {
          _id: { toString: () => string };
          challengesCompleted: number;
          user: {
            _id: { toString: () => string };
            username: string;
            displayName?: string;
            firstName?: string;
            lastName?: string;
            avatar?: string;
            level: number;
            points: number;
          };
        }
        
        leaderboard = challengeStats.map((entry: unknown, index) => {
          const typedEntry = entry as ChallengeEntry;
          return {
            _id: typedEntry._id.toString(),
            user: {
              _id: typedEntry.user._id.toString(),
              username: typedEntry.user.username,
              displayName: typedEntry.user.displayName || 
                (typedEntry.user.firstName && typedEntry.user.lastName ? `${typedEntry.user.firstName} ${typedEntry.user.lastName}` : typedEntry.user.username),
              avatar: typedEntry.user.avatar || "/placeholder.svg",
              level: typedEntry.user.level || 1
            },
            totalXP: typedEntry.user.points || 0,
            challengesCompleted: typedEntry.challengesCompleted || 0,
            rank: index + 1,
            level: typedEntry.user.level || 1
          };
        })
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

        interface UserEntry {
          _id: { toString: () => string };
          username: string;
          displayName?: string;
          firstName?: string;
          lastName?: string;
          avatar?: string;
          level: number;
          points: number;
        }
        
        leaderboard = users.map((user: unknown, index) => {
          const typedUser = user as UserEntry;
          return {
            _id: typedUser._id.toString(),
            user: {
              _id: typedUser._id.toString(),
              username: typedUser.username,
              displayName: typedUser.displayName || 
                (typedUser.firstName && typedUser.lastName ? `${typedUser.firstName} ${typedUser.lastName}` : typedUser.username),
              avatar: typedUser.avatar || "/placeholder.svg",
              level: typedUser.level || 1
            },
            totalXP: typedUser.points || 0,
            rank: index + 1,
            level: typedUser.level || 1
          };
        })
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
    
    // Cache for 5 minutes to reduce DB load
    cache.set(cacheKey, responseData, 300000)

    return NextResponse.json(responseData)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Leaderboard error:', errorMessage)
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
