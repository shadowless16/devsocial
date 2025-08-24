import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { tool, args } = await request.json()

    if (tool === 'get_leaderboard') {
      await connectDB()
      const limit = args?.limit || 10
      const timeframe = args?.timeframe || 'all-time'

      let timeFilter = {}
      if (timeframe === 'weekly') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        timeFilter = { lastActive: { $gte: weekAgo } }
      } else if (timeframe === 'monthly') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        timeFilter = { lastActive: { $gte: monthAgo } }
      }

      const users = await User.find(timeFilter)
        .select('username displayName firstName lastName avatar points level badges followersCount followingCount')
        .sort({ points: -1 })
        .limit(limit)
        .lean()

      const leaderboard = users.map((user: any, index) => ({
        _id: user._id.toString(),
        user: {
          _id: user._id.toString(),
          username: user.username,
          displayName: user.displayName ||
            (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username),
          avatar: user.avatar,
          level: user.level
        },
        totalXP: user.points,
        rank: index + 1,
        level: user.level
      }))

      return NextResponse.json(leaderboard)
    }
    
    if (tool === 'get_growth_metrics') {
      await connectDB()
      
      const days = args?.days || 30
      const userType = args?.userType || 'all'
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      // Build user filter based on userType
      let userFilter = {}
      if (userType === 'real') {
        userFilter = { isGenerated: { $ne: true } }
      } else if (userType === 'generated') {
        userFilter = { isGenerated: true }
      }
      
      const totalUsers = await User.countDocuments(userFilter)
      const newUsers = await User.countDocuments({
        ...userFilter,
        createdAt: { $gte: startDate }
      })
      
      const previousPeriodStart = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000))
      const previousNewUsers = await User.countDocuments({
        ...userFilter,
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      })
      
      const growthRate = previousNewUsers > 0 
        ? ((newUsers - previousNewUsers) / previousNewUsers * 100).toFixed(2)
        : '0.00'
      
      return NextResponse.json({
        totalUsers,
        newUsers,
        growthRate: parseFloat(growthRate),
        acquisitionChannels: [
          { channel: 'Organic Search', users: Math.floor(totalUsers * 0.35), cac: 0 },
          { channel: 'Social Media', users: Math.floor(totalUsers * 0.25), cac: 5.4 },
          { channel: 'Direct', users: Math.floor(totalUsers * 0.20), cac: 0 },
          { channel: 'Referrals', users: Math.floor(totalUsers * 0.15), cac: 4.7 }
        ],
        userType,
        userCounts: {
          total: await User.countDocuments(),
          real: await User.countDocuments({ isGenerated: { $ne: true } }),
          generated: await User.countDocuments({ isGenerated: true })
        }
      })
    }
    
    return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
    
  } catch (error) {
    console.error('MCP API error:', error)
    return NextResponse.json(
      { error: 'MCP request failed' },
      { status: 500 }
    )
  }
}
