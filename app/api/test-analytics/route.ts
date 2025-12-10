import { AnalyticsService } from '@/lib/analytics/analytics-service'
import connectDB from '@/lib/core/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    
    // Generate sample data for today
    await AnalyticsService.generateDailySnapshot(new Date())
    
    // Get overview data
    const overview = await AnalyticsService.getAnalyticsOverview(7)
    
    // Get real-time data
    const realtime = await AnalyticsService.getRealTimeAnalytics()
    
    return NextResponse.json({
      success: true,
      message: 'Analytics test completed successfully',
      data: {
        overview: {
          userAnalytics: overview.userAnalytics.length,
          contentAnalytics: overview.contentAnalytics.length,
          platformAnalytics: overview.platformAnalytics.length
        },
        realtime: {
          activeUsers: realtime.activeUsers,
          newPosts: realtime.newPosts,
          newComments: realtime.newComments
        }
      }
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Analytics test error:', errorMessage)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analytics test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
