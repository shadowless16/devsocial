import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { AnalyticsService } from '@/lib/analytics/analytics-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only allow admin users to generate sample data
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Generate analytics data for the last 7 days
    const promises = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      promises.push(AnalyticsService.generateDailySnapshot(date))
    }
    
    await Promise.all(promises)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample analytics data generated for the last 7 days' 
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Generate sample analytics error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to generate sample analytics data' },
      { status: 500 }
    )
  }
}
