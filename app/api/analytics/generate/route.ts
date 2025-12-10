import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server-auth'
import { AnalyticsService } from '@/lib/analytics/analytics-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { days = 7 } = await request.json()
    
    // Generate analytics for the last N days
    const results = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      await AnalyticsService.generateDailySnapshot(date)
      results.push(`Generated analytics for ${date.toDateString()}`)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Generated analytics for ${days} days`,
      results 
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Analytics generation error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}
