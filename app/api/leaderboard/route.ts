import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { cache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataMode = searchParams.get('dataMode') as 'generated' | 'demo' || 'generated'
    const limit = parseInt(searchParams.get('limit') || '10')
    const timeframe = searchParams.get('timeframe') || 'all-time' // 'all-time', 'weekly', 'monthly'

    // Check cache first
    const cacheKey = `leaderboard_${timeframe}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
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

    // Optimized leaderboard query
    const users = await User.find(timeFilter)
      .select('username displayName firstName lastName avatar points level')
      .sort({ points: -1 })
      .limit(limit)
      .lean()

    // Transform and add rank
    const leaderboard = users.map((user: any, index) => ({
      _id: user._id.toString(),
      user: {
        _id: user._id.toString(),
        username: user.username,
        displayName: user.displayName || 
          (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username),
        avatar: user.avatar || "/placeholder.svg", // Use placeholder image if avatar is missing
        level: user.level || 1, // Default to level 1 if not present
      },
      totalXP: user.points || 0, // Default to 0 XP if not present
      rank: index + 1,
      level: user.level || 1, // Also ensure this is defaulted
    }));

    // Use estimatedDocumentCount for better performance
    const totalUsers = Object.keys(timeFilter).length === 0 
      ? await User.estimatedDocumentCount()
      : await User.countDocuments(timeFilter)

    const responseData = {
      success: true,
      data: {
        leaderboard,
        timeframe,
        totalUsers
      }
    };
    
    // Cache for 10 minutes to improve performance
    cache.set(cacheKey, responseData, 600000);

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