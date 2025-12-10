import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { AnalyticsService } from '@/lib/analytics/analytics-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has analytics access
    if (session.user.role !== 'admin' && session.user.role !== 'analytics') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const realTimeData = await AnalyticsService.getRealTimeAnalytics()
    
    return NextResponse.json(realTimeData)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Real-time analytics error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    )
  }
}
