import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { sampleLeaderboard, getDataByMode } from '@/lib/data-mode-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataMode = searchParams.get('dataMode') as 'generated' | 'demo' || 'generated'
    const limit = parseInt(searchParams.get('limit') || '10')
    const timeframe = searchParams.get('timeframe') || 'all-time' // 'all-time', 'weekly', 'monthly'

    // If demo mode, return sample data
    if (dataMode === 'demo') {
      return NextResponse.json({
        success: true,
        data: {
          leaderboard: sampleLeaderboard.slice(0, limit),
          timeframe,
          totalUsers: sampleLeaderboard.length
        }
      })
    }

    await connectDB()

    // Build time filter for weekly/monthly
    let timeFilter = {}
    if (timeframe === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      timeFilter = { lastActive: { $gte: weekAgo } }
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      timeFilter = { lastActive: { $gte: monthAgo } }
    }

    // Get top users from database
    const users = await User.find(timeFilter)
      .select('username displayName firstName lastName avatar points level badges followersCount followingCount')
      .sort({ points: -1 })
      .limit(limit)
      .lean()

    // Transform and add rank
    const leaderboard = users.map((user: any, index) => ({
      ...user,
      id: user._id.toString(),
      displayName: user.displayName || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username),
      rank: index + 1
    }))

    const totalUsers = await User.countDocuments(timeFilter)

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        timeframe,
        totalUsers
      }
    })

  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}