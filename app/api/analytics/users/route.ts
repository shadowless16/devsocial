import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { UserAnalytics } from '@/models/Analytics'
import User from '@/models/User'
import connectDB from '@/lib/core/db'

interface UserAnalyticsData {
  date: Date
  totalUsers: number
  newUsers: number
  activeUsers: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
  demographics: {
    countries: Array<{ country: string; count: number; percentage: number }>
    devices: Array<{ device: string; count: number; percentage: number }>
    acquisitionChannels?: Array<{ channel: string; users: number; percentage: number }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== 'admin' && session.user.role !== 'analytics') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const userAnalytics = await UserAnalytics.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }).limit(days).lean() as unknown as UserAnalyticsData[]
    
    // Format date helper
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    // Calculate growth trends
    const growthTrends = userAnalytics.map((day, index) => {
      const previousDay = userAnalytics[index + 1]
      const growth = previousDay ? 
        Math.round(((day.newUsers - previousDay.newUsers) / previousDay.newUsers) * 100) : 0
      
      return {
        date: formatDate(day.date),
        totalUsers: day.totalUsers,
        newUsers: day.newUsers,
        activeUsers: day.dailyActiveUsers,
        weeklyActiveUsers: day.weeklyActiveUsers,
        monthlyActiveUsers: day.monthlyActiveUsers,
        growth,
        retention: day.userRetention
      }
    }).reverse()
    
    // Aggregate demographics and acquisition channels
    const latestAnalytics = userAnalytics[0]
    const demographics = latestAnalytics?.demographics || { countries: [], devices: [] }
    
    // Get acquisition channels for the period
    const acquisitionData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$registrationSource',
          count: { $sum: 1 }
        }
      }
    ])
    
    const totalUsers = acquisitionData.reduce((sum, item) => sum + item.count, 0)
    const acquisitionChannels = acquisitionData.map(item => ({
      channel: item._id || 'direct',
      users: item.count,
      percentage: totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0
    }))
    
    demographics.acquisitionChannels = acquisitionChannels
    
    // Calculate retention cohorts
    const retentionData = userAnalytics.map(day => ({
      date: formatDate(day.date),
      day1: day.userRetention?.day1 || 0,
      day7: day.userRetention?.day7 || 0,
      day30: day.userRetention?.day30 || 0
    })).reverse()
    
    const response = {
      summary: {
        totalUsers: latestAnalytics?.totalUsers || 0,
        newUsersToday: latestAnalytics?.newUsers || 0,
        activeUsersToday: latestAnalytics?.dailyActiveUsers || 0,
        weeklyActiveUsers: latestAnalytics?.weeklyActiveUsers || 0,
        monthlyActiveUsers: latestAnalytics?.monthlyActiveUsers || 0,
        avgRetention: {
          day1: Math.round(userAnalytics.reduce((sum, day) => sum + (day.userRetention?.day1 || 0), 0) / userAnalytics.length),
          day7: Math.round(userAnalytics.reduce((sum, day) => sum + (day.userRetention?.day7 || 0), 0) / userAnalytics.length),
          day30: Math.round(userAnalytics.reduce((sum, day) => sum + (day.userRetention?.day30 || 0), 0) / userAnalytics.length)
        }
      },
      trends: growthTrends,
      demographics,
      retention: retentionData,
      period: {
        start: startDate,
        end: endDate,
        days
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('User analytics error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch user analytics' },
      { status: 500 }
    )
  }
}
