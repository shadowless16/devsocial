import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { AnalyticsService } from '@/lib/analytics/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    console.log('Analytics API - Session:', JSON.stringify(session, null, 2))
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Analytics API - User role:', session.user.role)
    
    // Check if user has analytics access (admin or analytics role)
    if (session.user.role !== 'admin' && session.user.role !== 'analytics') {
      return NextResponse.json({ 
        error: 'Access denied. Analytics access required.',
        userRole: session.user.role,
        requiredRoles: ['admin', 'analytics']
      }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const analyticsData = await AnalyticsService.getAnalyticsOverview(days)
    
    interface AnalyticsDay {
      totalUsers?: number
      newUsers?: number
      dailyActiveUsers?: number
      date?: string
      totalPosts?: number
      engagementRate?: number
      newPosts?: number
      newComments?: number
      newLikes?: number
      pageViews?: number
      sessionDuration?: number
      bounceRate?: number
      demographics?: { countries: unknown[]; devices: unknown[] }
      topTags?: unknown[]
      topPages?: unknown[]
      xpDistribution?: unknown[]
      badgeStats?: unknown[]
      challengeStats?: Record<string, unknown>
    }

    interface GrowthDay {
      growthRate?: { daily?: number }
    }

    // Process data for overview dashboard
    const overview = {
      summary: {
        totalUsers: (analyticsData.userAnalytics[0] as AnalyticsDay)?.totalUsers || 0,
        newUsers: analyticsData.userAnalytics.reduce((sum, day) => sum + ((day as AnalyticsDay).newUsers || 0), 0),
        totalPosts: (analyticsData.contentAnalytics[0] as AnalyticsDay)?.totalPosts || 0,
        engagementRate: (analyticsData.contentAnalytics[0] as AnalyticsDay)?.engagementRate || 0,
        growthRate: (analyticsData.growthAnalytics[0] as GrowthDay)?.growthRate?.daily || 0,
        activeUsers: (analyticsData.userAnalytics[0] as AnalyticsDay)?.dailyActiveUsers || 0
      },
      trends: {
        userGrowth: analyticsData.userAnalytics.map((day: unknown) => {
          const d = day as AnalyticsDay
          return {
            date: d.date,
            newUsers: d.newUsers,
            totalUsers: d.totalUsers,
            activeUsers: d.dailyActiveUsers
          }
        }).reverse(),
        contentGrowth: analyticsData.contentAnalytics.map((day: unknown) => {
          const d = day as AnalyticsDay
          return {
            date: d.date,
            posts: d.newPosts,
            comments: d.newComments,
            likes: d.newLikes,
            engagement: d.engagementRate
          }
        }).reverse(),
        platformMetrics: analyticsData.platformAnalytics.map((day: unknown) => {
          const d = day as AnalyticsDay
          return {
            date: d.date,
            pageViews: d.pageViews,
            sessionDuration: d.sessionDuration,
            bounceRate: d.bounceRate
          }
        }).reverse()
      },
      demographics: (analyticsData.userAnalytics[0] as AnalyticsDay)?.demographics || { countries: [], devices: [] },
      topContent: {
        tags: (analyticsData.contentAnalytics[0] as AnalyticsDay)?.topTags || [],
        pages: (analyticsData.platformAnalytics[0] as AnalyticsDay)?.topPages || []
      },
      gamification: {
        xpDistribution: (analyticsData.gamificationAnalytics[0] as AnalyticsDay)?.xpDistribution || [],
        badgeStats: (analyticsData.gamificationAnalytics[0] as AnalyticsDay)?.badgeStats || [],
        challengeStats: (analyticsData.gamificationAnalytics[0] as AnalyticsDay)?.challengeStats || {}
      }
    }
    
    return NextResponse.json(overview)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Analytics overview error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    )
  }
}
