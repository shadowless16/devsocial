import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has analytics access (admin or analytics role)
    if (session.user.role !== 'admin' && session.user.role !== 'analytics') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const period = searchParams.get('period') || 'daily'
    
    const analyticsData = await AnalyticsService.getAnalyticsOverview(days)
    
    // Process data for overview dashboard
    const overview = {
      summary: {
        totalUsers: analyticsData.userAnalytics[0]?.totalUsers || 0,
        newUsers: analyticsData.userAnalytics.reduce((sum, day) => sum + (day.newUsers || 0), 0),
        totalPosts: analyticsData.contentAnalytics[0]?.totalPosts || 0,
        engagementRate: analyticsData.contentAnalytics[0]?.engagementRate || 0,
        growthRate: analyticsData.growthAnalytics[0]?.growthRate?.daily || 0,
        activeUsers: analyticsData.userAnalytics[0]?.dailyActiveUsers || 0
      },
      trends: {
        userGrowth: analyticsData.userAnalytics.map(day => ({
          date: day.date,
          newUsers: day.newUsers,
          totalUsers: day.totalUsers,
          activeUsers: day.dailyActiveUsers
        })).reverse(),
        contentGrowth: analyticsData.contentAnalytics.map(day => ({
          date: day.date,
          posts: day.newPosts,
          comments: day.newComments,
          likes: day.newLikes,
          engagement: day.engagementRate
        })).reverse(),
        platformMetrics: analyticsData.platformAnalytics.map(day => ({
          date: day.date,
          pageViews: day.pageViews,
          sessionDuration: day.sessionDuration,
          bounceRate: day.bounceRate
        })).reverse()
      },
      demographics: analyticsData.userAnalytics[0]?.demographics || { countries: [], devices: [] },
      topContent: {
        tags: analyticsData.contentAnalytics[0]?.topTags || [],
        pages: analyticsData.platformAnalytics[0]?.topPages || []
      },
      gamification: {
        xpDistribution: analyticsData.gamificationAnalytics[0]?.xpDistribution || [],
        badgeStats: analyticsData.gamificationAnalytics[0]?.badgeStats || [],
        challengeStats: analyticsData.gamificationAnalytics[0]?.challengeStats || {}
      }
    }
    
    return NextResponse.json(overview)
    
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}